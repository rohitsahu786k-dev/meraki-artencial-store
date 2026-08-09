import Link from "next/link";
import { LockKeyhole, PackageCheck, ShieldCheck, UserRound } from "lucide-react";
import { WP_URL, wordpressUrl } from "@/lib/wp";

export const metadata = { title: "My Account", description: "Sign in or create your Meraki Artencial Store account." };

function hiddenValue(html, name) {
  const pattern = new RegExp(`name=["']${name}["'][^>]*value=["']([^"']+)["']|value=["']([^"']+)["'][^>]*name=["']${name}["']`, "i");
  const match = html.match(pattern);
  return match?.[1] || match?.[2] || "";
}

async function getAccountNonces() {
  const response = await fetch(`${WP_URL}/my-account/`, { next: { revalidate: 0 } }).catch(() => null);
  if (!response?.ok) return {};
  const html = await response.text();
  return {
    login: hiddenValue(html, "woocommerce-login-nonce"),
    register: hiddenValue(html, "woocommerce-register-nonce"),
    registrationEnabled: /woocommerce-form-register|name=["']register["']/i.test(html),
  };
}

export default async function AccountPage() {
  const nonces = await getAccountNonces();
  const accountUrl = wordpressUrl("/my-account/");
  return (
    <div className="container account-page">
      <div className="account-hero"><span className="eyebrow">Your Meraki account</span><h1>Welcome back.</h1><p>Sign in to your WooCommerce account for orders, addresses and account details. Your credentials are submitted directly to WordPress.</p></div>
      <div className="account-layout">
        <section className="account-card">
          <div className="account-card-title"><UserRound size={22} /><div><h2>Sign in</h2><p>Access existing WooCommerce orders and details.</p></div></div>
          <form className="account-form" action={accountUrl} method="post">
            <label>Email or username<input name="username" autoComplete="username" required /></label>
            <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
            <label className="account-check"><input type="checkbox" name="rememberme" value="forever" /> Remember me</label>
            {nonces.login ? <input type="hidden" name="woocommerce-login-nonce" value={nonces.login} /> : null}
            <input type="hidden" name="_wp_http_referer" value="/my-account/" />
            <button className="button" type="submit" name="login" value="Log in"><LockKeyhole size={17} /> Sign in securely</button>
            <a className="account-text-link" href={wordpressUrl("/my-account/lost-password/")}>Forgot your password?</a>
          </form>
        </section>

        <section className="account-card account-register">
          <div className="account-card-title"><PackageCheck size={22} /><div><h2>Create account</h2><p>Faster account management on your WordPress store.</p></div></div>
          {nonces.registrationEnabled ? <form className="account-form" action={accountUrl} method="post">
            <label>Email address<input type="email" name="email" autoComplete="email" required /></label>
            {nonces.register ? <input type="hidden" name="woocommerce-register-nonce" value={nonces.register} /> : null}
            <input type="hidden" name="_wp_http_referer" value="/my-account/" />
            <p className="account-note">WooCommerce will create the account according to the registration settings configured in WordPress.</p>
            <button className="button secondary" type="submit" name="register" value="Register">Create account</button>
          </form> : <div className="account-form"><p className="account-note">Account registration is currently controlled by your WooCommerce settings.</p><a className="button secondary" href={accountUrl}>Open WooCommerce account</a></div>}
        </section>
      </div>
      <div className="account-trust"><ShieldCheck size={18} /><span>Login, registration, orders and saved addresses remain on your WordPress/WooCommerce backend.</span><Link href="/contact">Need help?</Link></div>
    </div>
  );
}
