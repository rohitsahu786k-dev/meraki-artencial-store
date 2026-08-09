<?php
/**
 * Plugin Name: Meraki Headless Commerce Bridge
 * Description: Transfers the Next.js bag into WooCommerce before cart or checkout.
 * Version: 1.1.0
 * Author: iPrix Media
 */

defined( 'ABSPATH' ) || exit;

add_action( 'template_redirect', function () {
	if ( empty( $_GET['meraki_cart_handoff'] ) ) {
		return;
	}

	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		wp_die( esc_html__( 'WooCommerce cart is unavailable.', 'meraki-headless-bridge' ) );
	}

	$encoded = sanitize_text_field( wp_unslash( $_GET['meraki_cart_handoff'] ) );
	if ( strlen( $encoded ) > 12000 ) {
		wp_die( esc_html__( 'Cart request is too large.', 'meraki-headless-bridge' ) );
	}

	$encoded .= str_repeat( '=', ( 4 - strlen( $encoded ) % 4 ) % 4 );
	$payload = json_decode( base64_decode( strtr( $encoded, '-_', '+/' ), true ), true );
	if ( ! is_array( $payload ) || empty( $payload['items'] ) || ! is_array( $payload['items'] ) ) {
		wp_die( esc_html__( 'Cart request is invalid.', 'meraki-headless-bridge' ) );
	}

	WC()->cart->empty_cart();
	foreach ( array_slice( $payload['items'], 0, 20 ) as $item ) {
		$product_id  = absint( $item['product_id'] ?? 0 );
		$variation_id = absint( $item['variation_id'] ?? 0 );
		$quantity = min( 99, max( 1, absint( $item['quantity'] ?? 1 ) ) );
		$product = wc_get_product( $variation_id ?: $product_id );
		if ( ! $product || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
			continue;
		}

		$variation = array();
		foreach ( (array) ( $item['variation'] ?? array() ) as $key => $value ) {
			$attribute_key = 0 === strpos( $key, 'attribute_' ) ? $key : 'attribute_' . sanitize_title( $key );
			$variation[ sanitize_key( $attribute_key ) ] = sanitize_title( $value );
		}
		WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation );
	}

	if ( ! empty( $payload['coupon'] ) ) {
		WC()->cart->apply_coupon( wc_format_coupon_code( sanitize_text_field( $payload['coupon'] ) ) );
	}
	WC()->cart->calculate_totals();
	if ( ! empty( $payload['storefront'] ) ) {
		$storefront = esc_url_raw( $payload['storefront'] );
		$host = wp_parse_url( $storefront, PHP_URL_HOST );
		$allowed_hosts = apply_filters( 'meraki_allowed_storefront_hosts', array( wp_parse_url( home_url(), PHP_URL_HOST ), 'localhost', '127.0.0.1' ) );
		if ( wp_http_validate_url( $storefront ) && in_array( $host, $allowed_hosts, true ) ) {
			WC()->session->set( 'meraki_storefront_url', untrailingslashit( $storefront ) );
		}
	}

	$target = ( $payload['redirect'] ?? '' ) === 'checkout' ? wc_get_checkout_url() : wc_get_cart_url();
	wp_safe_redirect( $target );
	exit;
}, 5 );

add_filter( 'woocommerce_email_header_image', function () {
	return 'https://merakiartencialstore.com/wp-content/uploads/2023/01/cropped-IMG-20221101-WA0006-removebg-preview-1.webp';
} );

add_filter( 'woocommerce_email_footer_text', function () {
	return 'Meraki Artencial Store | Premium resin art supplies, jewellery and creative accessories | Udaipur, Rajasthan';
} );

add_filter( 'woocommerce_email_styles', function ( $css ) {
	$css .= '
		body { background:#f4f3f0 !important; color:#171717 !important; font-family:Arial,Helvetica,sans-serif !important; font-weight:400 !important; }
		#wrapper { padding:32px 12px !important; }
		#template_container { max-width:640px !important; border:1px solid #dedbd4 !important; border-radius:0 !important; box-shadow:0 12px 38px rgba(0,0,0,.06) !important; }
		#template_header { background:#111 !important; border-radius:0 !important; }
		#template_header h1 { color:#fff !important; font-size:24px !important; line-height:1.3 !important; font-weight:400 !important; letter-spacing:0 !important; }
		#template_body td, #template_body th, #body_content_inner { color:#272727 !important; font-size:14px !important; line-height:1.65 !important; font-weight:400 !important; }
		#template_body h2, #template_body h3 { color:#111 !important; font-weight:400 !important; letter-spacing:0 !important; }
		#template_body table.td { border-color:#dedbd4 !important; }
		#template_body th { background:#f7f5f1 !important; }
		#template_body a { color:#8a6715 !important; text-decoration:underline !important; }
		#template_footer td { color:#5f5b54 !important; font-size:11px !important; line-height:1.6 !important; }
		#template_footer a { color:#5f5b54 !important; }
		.email-order-details img { border-radius:0 !important; }
		@media only screen and (max-width:620px) { #wrapper { padding:12px 4px !important; } #template_header h1 { font-size:20px !important; } #body_content td { padding:22px 16px !important; } }
	';
	return $css;
} );

add_action( 'woocommerce_thankyou', function ( $order_id ) {
	if ( ! $order_id ) {
		return;
	}
	$storefront = WC()->session ? WC()->session->get( 'meraki_storefront_url' ) : '';
	$storefront = $storefront ?: home_url( '/' );
	echo '<section class="meraki-order-care"><h2>' . esc_html__( 'What happens next?', 'meraki-headless-bridge' ) . '</h2><div><span><strong>1</strong>Order confirmation is sent by email.</span><span><strong>2</strong>Your order is prepared and packed with care.</span><span><strong>3</strong>Tracking details are shared after dispatch.</span></div><a class="button" href="' . esc_url( $storefront ) . '">' . esc_html__( 'Continue shopping', 'meraki-headless-bridge' ) . '</a></section>';
}, 25 );

add_action( 'wp_head', function () {
	if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
		return;
	}
	echo '<style>body.woocommerce-checkout{background:#f7f6f3;color:#171717;font-family:Arial,Helvetica,sans-serif;font-weight:400}body.woocommerce-checkout h1,body.woocommerce-checkout h2,body.woocommerce-checkout h3,body.woocommerce-checkout strong{font-weight:400}.woocommerce-checkout form.checkout{max-width:1180px;margin:24px auto 60px;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.78fr);gap:44px}.woocommerce-checkout #customer_details{width:auto;float:none}.woocommerce-checkout #order_review_heading,.woocommerce-checkout #order_review{width:auto;float:none}.woocommerce-checkout .form-row input.input-text,.woocommerce-checkout .form-row textarea,.woocommerce-checkout .select2-selection{min-height:46px;border:1px solid #d8d4cc!important;border-radius:0!important;background:#fff;padding:10px 12px}.woocommerce-checkout #order_review{padding:22px;border:1px solid #d8d4cc;background:#fff}.woocommerce-checkout #payment{background:#f3f0e9;border-radius:0}.woocommerce-checkout #payment div.payment_box{background:#fff}.woocommerce-checkout #place_order{width:100%;min-height:50px;border-radius:0;background:#111;color:#fff;text-transform:uppercase;font-weight:400}.woocommerce-checkout .woocommerce-form-coupon-toggle,.woocommerce-checkout .woocommerce-info{border-top-color:#b68a24}.woocommerce-order{max-width:980px;margin:40px auto;padding:0 20px;font-weight:400}.woocommerce-thankyou-order-received{font-size:24px;border-block:1px solid #dedbd4;padding:24px 0}.woocommerce-order-overview{display:grid!important;grid-template-columns:repeat(4,1fr);gap:1px;background:#dedbd4;padding:1px!important}.woocommerce-order-overview li{background:#fff;margin:0!important;padding:16px!important;border:0!important}.meraki-order-care{margin:36px 0;border-top:1px solid #dedbd4;padding-top:26px}.meraki-order-care h2{font-weight:400}.meraki-order-care div{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}.meraki-order-care span{display:flex;gap:10px;padding:15px;border:1px solid #dedbd4}.meraki-order-care strong{font-weight:400;color:#9b761d}@media(max-width:760px){.woocommerce-checkout form.checkout{display:block;margin:18px 14px}.woocommerce-checkout #order_review{margin-top:24px;padding:14px}.woocommerce-order-overview,.meraki-order-care div{grid-template-columns:1fr}.woocommerce-order{margin-top:20px}}</style>';
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'meraki/v1', '/contact', array(
		'methods'             => 'POST',
		'permission_callback' => function () { return current_user_can( 'manage_options' ); },
		'callback'            => function ( WP_REST_Request $request ) {
			$name    = sanitize_text_field( $request->get_param( 'name' ) );
			$email   = sanitize_email( $request->get_param( 'email' ) );
			$phone   = sanitize_text_field( $request->get_param( 'phone' ) );
			$query   = sanitize_text_field( $request->get_param( 'query' ) );
			$subject = sanitize_text_field( $request->get_param( 'subject' ) );
			$message = sanitize_textarea_field( $request->get_param( 'message' ) );
			if ( ! $name || ! is_email( $email ) || ! $subject || strlen( $message ) < 10 ) {
				return new WP_Error( 'invalid_enquiry', 'Please complete all required fields.', array( 'status' => 400 ) );
			}
			$body = '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;border:1px solid #dedbd4"><div style="background:#111;color:#fff;padding:24px"><h1 style="font-size:22px;font-weight:400;margin:0">New customer enquiry</h1></div><div style="padding:24px;color:#222;line-height:1.65"><p><strong style="font-weight:400;color:#806218">' . esc_html( $query ) . '</strong></p><p><b>Name:</b> ' . esc_html( $name ) . '<br><b>Email:</b> ' . esc_html( $email ) . '<br><b>Phone:</b> ' . esc_html( $phone ) . '</p><h2 style="font-size:17px;font-weight:400">' . esc_html( $subject ) . '</h2><p>' . nl2br( esc_html( $message ) ) . '</p></div></div>';
			$headers = array( 'Content-Type: text/html; charset=UTF-8', 'Reply-To: ' . $name . ' <' . $email . '>' );
			$sent = wp_mail( get_option( 'admin_email' ), '[Meraki Enquiry] ' . $subject, $body, $headers );
			return $sent ? rest_ensure_response( array( 'sent' => true ) ) : new WP_Error( 'mail_failed', 'Email could not be sent.', array( 'status' => 500 ) );
		},
	) );
} );
