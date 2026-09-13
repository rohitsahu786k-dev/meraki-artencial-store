<?php
/**
 * Plugin Name: Meraki Storefront Manager & Headless Bridge
 * Plugin URI: https://merakiartencialstore.com
 * Description: Enterprise Headless Bridge for Next.js App Router: Hero Banners, ACF Store Data, ISR Cache Purging, Headless Email OTP Authentication, AST Shipment Tracking, Subdomain Routing, and Admin White-Labeling.
 * Version: 2.0.0
 * Author: Meraki Artencial Store
 * Text Domain: meraki-store
 */

if (!defined('ABSPATH')) exit;

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================
if (!defined('MERAKI_FRONTEND_URL')) {
    define('MERAKI_FRONTEND_URL', getenv('NEXT_PUBLIC_SITE_URL') ?: 'https://merakiartencialstore.com');
}
if (!defined('MERAKI_REVALIDATION_SECRET')) {
    define('MERAKI_REVALIDATION_SECRET', getenv('REVALIDATION_SECRET') ?: 'meraki_headless_reval_sec_2026');
}
if (!defined('MERAKI_SUPPORT_EMAIL')) {
    define('MERAKI_SUPPORT_EMAIL', 'support@merakiartencialstore.com');
}
if (!defined('MERAKI_STORE_NAME')) {
    define('MERAKI_STORE_NAME', 'Meraki Artencial Store');
}

// =============================================================================
// 1. REGISTER CUSTOM POST TYPES & ACF FIELDS
// =============================================================================
add_action('init', 'meraki_register_post_types');
function meraki_register_post_types() {
    $labels = array(
        'name'               => 'Hero Banners',
        'singular_name'      => 'Hero Banner',
        'menu_name'          => 'Hero Banners',
        'name_admin_bar'     => 'Hero Banner',
        'add_new'            => 'Add New Banner',
        'add_new_item'       => 'Add New Hero Banner',
        'new_item'           => 'New Hero Banner',
        'edit_item'          => 'Edit Hero Banner',
        'view_item'          => 'View Hero Banner',
        'all_items'          => 'All Banners',
        'search_items'       => 'Search Banners',
        'not_found'          => 'No banners found',
        'not_found_in_trash' => 'No banners found in Trash',
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'banners'),
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'menu_position'      => 20,
        'menu_icon'          => 'dashicons-images-alt2',
        'supports'           => array('title', 'thumbnail', 'page-attributes'),
        'show_in_rest'       => true,
        'rest_base'          => 'banners',
    );

    register_post_type('meraki_banner', $args);
}

// Auto-resolve ACF attachment IDs in REST API responses
add_filter('rest_prepare_meraki_banner', 'meraki_resolve_banner_rest_images', 10, 3);
function meraki_resolve_banner_rest_images($response, $post, $request) {
    if (empty($response->data)) return $response;
    
    $desktop = get_field('desktop_image', $post->ID);
    $mobile  = get_field('mobile_image', $post->ID);

    $response->data['desktop_image_url'] = is_array($desktop) ? $desktop['url'] : (is_numeric($desktop) ? wp_get_attachment_url($desktop) : $desktop);
    $response->data['mobile_image_url']  = is_array($mobile) ? $mobile['url'] : (is_numeric($mobile) ? wp_get_attachment_url($mobile) : $response->data['desktop_image_url']);
    $response->data['cta_link']          = get_field('link', $post->ID) ?: '/shop';
    $response->data['subtitle']          = get_field('subtitle', $post->ID) ?: '';
    $response->data['is_active']         = get_field('is_active', $post->ID) !== false;

    return $response;
}

// Register ACF Fields for Hero Banners & Storefront Settings
add_action('acf/init', 'meraki_register_acf_fields');
function meraki_register_acf_fields() {
    if (!function_exists('acf_add_local_field_group')) return;

    // Field Group for Hero Banner CPT
    acf_add_local_field_group(array(
        'key' => 'group_meraki_banner_details',
        'title' => 'Banner Images & Settings',
        'fields' => array(
            array(
                'key' => 'field_meraki_banner_desktop',
                'label' => 'Desktop Banner Image',
                'name' => 'desktop_image',
                'type' => 'image',
                'instructions' => 'Recommended: 1920x600px or 1600x500px (JPG/WebP/PNG)',
                'required' => 1,
                'return_format' => 'url',
                'preview_size' => 'medium',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_banner_mobile',
                'label' => 'Mobile Phone Banner Image',
                'name' => 'mobile_image',
                'type' => 'image',
                'instructions' => 'Recommended: 800x800px or 1080x1350px (Optional)',
                'required' => 0,
                'return_format' => 'url',
                'preview_size' => 'medium',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_banner_link',
                'label' => 'Banner Click Link',
                'name' => 'link',
                'type' => 'text',
                'default_value' => '/shop',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_banner_subtitle',
                'label' => 'Banner Subtitle / Promotional Tag',
                'name' => 'subtitle',
                'type' => 'text',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_banner_active',
                'label' => 'Active / Show on Storefront',
                'name' => 'is_active',
                'type' => 'true_false',
                'default_value' => 1,
                'ui' => 1,
                'show_in_rest' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'meraki_banner',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'show_in_rest' => true,
    ));

    // Field Group for Storefront Settings
    acf_add_local_field_group(array(
        'key' => 'group_meraki_storefront_settings',
        'title' => 'Storefront Announcements, Offers & Contact Details',
        'fields' => array(
            array(
                'key' => 'tab_meraki_announcements',
                'label' => '📢 Announcement & Offers',
                'type' => 'tab',
            ),
            array(
                'key' => 'field_meraki_top_announcement',
                'label' => 'Top Announcement Bar Text',
                'name' => 'top_announcement',
                'type' => 'text',
                'default_value' => 'MINIMUM ORDER RS. 300 | 100% AUTHENTIC ART MATERIALS | PAN INDIA DELIVERY',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_announcement_link',
                'label' => 'Announcement Click Link',
                'name' => 'announcement_link',
                'type' => 'text',
                'default_value' => '/shop',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_marquee_text',
                'label' => 'Homepage Scrolling Ribbon Text',
                'name' => 'marquee_text',
                'type' => 'text',
                'default_value' => 'MINIMUM ORDER RS. 300 | FREE SHIPPING ON ORDERS ABOVE RS. 3,000 | PREMIUM HANDCRAFTED ART SUPPLIES',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_active_coupon',
                'label' => 'Featured Offer / Coupon Code',
                'name' => 'active_coupon_code',
                'type' => 'text',
                'placeholder' => 'e.g. MERAKI10',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'tab_meraki_contact',
                'label' => '💬 WhatsApp & Contact Details',
                'type' => 'tab',
            ),
            array(
                'key' => 'field_meraki_whatsapp_number',
                'label' => 'WhatsApp Number',
                'name' => 'whatsapp_number',
                'type' => 'text',
                'default_value' => '917426915251',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_whatsapp_message',
                'label' => 'WhatsApp Greeting Message',
                'name' => 'whatsapp_greeting',
                'type' => 'text',
                'default_value' => 'Hello Meraki Artencial Store! I would like to inquire about your products.',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_support_phone',
                'label' => 'Customer Support Phone',
                'name' => 'support_phone',
                'type' => 'text',
                'default_value' => '+91 74269 15251',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_support_email',
                'label' => 'Customer Support Email',
                'name' => 'support_email',
                'type' => 'email',
                'default_value' => 'merakiartstore@gmail.com',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_store_address',
                'label' => 'Store Location & Address',
                'name' => 'store_address',
                'type' => 'text',
                'default_value' => 'Udaipur, Rajasthan, India - 313001',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_working_hours',
                'label' => 'Store Working Hours',
                'name' => 'working_hours',
                'type' => 'text',
                'default_value' => 'Mon - Sat: 10:00 AM - 7:00 PM IST',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_instagram_url',
                'label' => 'Official Instagram Profile URL',
                'name' => 'instagram_url',
                'type' => 'text',
                'default_value' => 'https://www.instagram.com/merakiartencialstore/',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'tab_meraki_homepage',
                'label' => '🏠 Homepage Categories',
                'type' => 'tab',
            ),
            array(
                'key' => 'field_meraki_homepage_categories',
                'label' => 'Homepage Featured Categories (Slugs or Names)',
                'name' => 'homepage_categories',
                'type' => 'text',
                'instructions' => 'Comma-separated category slugs to show on the homepage (e.g. silicone-and-resin-molds, bezels, dried-flowers, rings). Leave blank for auto top categories.',
                'default_value' => 'silicone-and-resin-molds, bezels, dried-flowers, rings, metal-stands',
                'show_in_rest' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'page_type',
                    'operator' => '==',
                    'value' => 'front_page',
                ),
            ),
            array(
                array(
                    'param' => 'page_template',
                    'operator' => '==',
                    'value' => 'default',
                ),
            ),
        ),
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'show_in_rest' => true,
    ));

    // Field Group for Page-Specific Banners
    acf_add_local_field_group(array(
        'key' => 'group_meraki_page_banners',
        'title' => 'Page Specific Banner (Shop, Blog, Contact, Pages)',
        'fields' => array(
            array(
                'key' => 'field_meraki_page_banner_desktop',
                'label' => 'Page Desktop Banner Image',
                'name' => 'page_banner_desktop',
                'type' => 'image',
                'instructions' => 'Optional desktop banner for this page',
                'required' => 0,
                'return_format' => 'url',
                'preview_size' => 'medium',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_page_banner_mobile',
                'label' => 'Page Mobile Banner Image',
                'name' => 'page_banner_mobile',
                'type' => 'image',
                'instructions' => 'Optional mobile banner for this page',
                'required' => 0,
                'return_format' => 'url',
                'preview_size' => 'medium',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_page_banner_subtitle',
                'label' => 'Page Banner Subtitle',
                'name' => 'page_banner_subtitle',
                'type' => 'text',
                'show_in_rest' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'page',
                ),
            ),
        ),
        'menu_order' => 1,
        'position' => 'normal',
        'style' => 'default',
        'show_in_rest' => true,
    ));
}

// REST API Route: /wp-json/meraki/v1/store-data
add_action('rest_api_init', function () {
    register_rest_route('meraki/v1', '/store-data', array(
        'methods'             => 'GET',
        'callback'            => 'meraki_get_store_data',
        'permission_callback' => '__return_true',
    ));
});

function meraki_get_store_data() {
    $front_page_id = get_option('page_on_front') ?: 5826;
    
    $banner_posts = get_posts(array(
        'post_type'      => 'meraki_banner',
        'posts_per_page' => 20,
        'post_status'    => 'publish',
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
    ));

    $banners = array();
    foreach ($banner_posts as $b) {
        $desktop = get_field('desktop_image', $b->ID) ?: get_the_post_thumbnail_url($b->ID, 'full');
        $mobile  = get_field('mobile_image', $b->ID) ?: $desktop;
        $link    = get_field('link', $b->ID) ?: '/shop';
        $active  = get_field('is_active', $b->ID);
        
        if ($active !== false && $desktop) {
            $banners[] = array(
                'id'          => $b->ID,
                'title'       => get_the_title($b->ID),
                'image'       => is_array($desktop) ? $desktop['url'] : $desktop,
                'mobileImage' => is_array($mobile) ? $mobile['url'] : $mobile,
                'href'        => $link,
                'subtitle'    => get_field('subtitle', $b->ID) ?: '',
            );
        }
    }

    // Page specific banners
    $pages_banners = array();
    $special_pages = get_posts(array(
        'post_type'      => 'page',
        'posts_per_page' => 20,
        'post_status'    => 'publish',
    ));
    foreach ($special_pages as $sp) {
        $pb_desktop = get_field('page_banner_desktop', $sp->ID);
        $pb_mobile  = get_field('page_banner_mobile', $sp->ID) ?: $pb_desktop;
        if ($pb_desktop) {
            $pages_banners[$sp->post_name] = array(
                'desktop'  => is_array($pb_desktop) ? $pb_desktop['url'] : $pb_desktop,
                'mobile'   => is_array($pb_mobile) ? $pb_mobile['url'] : $pb_mobile,
                'subtitle' => get_field('page_banner_subtitle', $sp->ID) ?: '',
            );
        }
    }

    $homepage_cats_raw = get_field('homepage_categories', $front_page_id) ?: get_option('meraki_homepage_categories', 'silicone-and-resin-molds, bezels, dried-flowers, rings, metal-stands');

    return array(
        'banners' => $banners,
        'homepage_categories' => is_string($homepage_cats_raw) ? array_map('trim', explode(',', $homepage_cats_raw)) : (array) $homepage_cats_raw,
        'announcement' => array(
            'text'   => get_field('top_announcement', $front_page_id) ?: get_option('meraki_top_announcement', 'MINIMUM ORDER RS. 300 | 100% AUTHENTIC ART MATERIALS | PAN INDIA DELIVERY'),
            'link'   => get_field('announcement_link', $front_page_id) ?: get_option('meraki_announcement_link', '/shop'),
            'coupon' => get_field('active_coupon_code', $front_page_id) ?: get_option('meraki_active_coupon_code', ''),
        ),
        'marquee' => get_field('marquee_text', $front_page_id) ?: get_option('meraki_marquee_text', 'MINIMUM ORDER RS. 300 | FREE SHIPPING ON ORDERS ABOVE RS. 3,000 | 100% AUTHENTIC RESIN ART MATERIALS'),
        'contact' => array(
            'whatsapp'     => get_field('whatsapp_number', $front_page_id) ?: get_option('meraki_whatsapp_number', '917426915251'),
            'greeting'     => get_field('whatsapp_greeting', $front_page_id) ?: get_option('meraki_whatsapp_greeting', 'Hello Meraki Artencial Store!'),
            'phone'        => get_field('support_phone', $front_page_id) ?: get_option('meraki_support_phone', '+91 74269 15251'),
            'email'        => get_field('support_email', $front_page_id) ?: get_option('meraki_support_email', 'merakiartstore@gmail.com'),
            'address'      => get_field('store_address', $front_page_id) ?: get_option('meraki_store_address', 'Udaipur, Rajasthan, India - 313001'),
            'workingHours' => get_field('working_hours', $front_page_id) ?: get_option('meraki_working_hours', 'Mon - Sat: 10:00 AM - 7:00 PM IST'),
            'instagramUrl' => get_field('instagram_url', $front_page_id) ?: get_option('meraki_instagram_url', 'https://www.instagram.com/merakiartencialstore/'),
        ),
        'pages_banners' => $pages_banners,
    );
}

// -----------------------------------------------------------------------------
// Admin Menu: ⚡ Storefront Settings (Direct backend management)
// -----------------------------------------------------------------------------
add_action('admin_menu', 'meraki_register_storefront_admin_menu');
function meraki_register_storefront_admin_menu() {
    add_menu_page(
        'Storefront Settings',
        '⚡ Storefront Manager',
        'manage_options',
        'meraki-storefront-settings',
        'meraki_render_storefront_settings_page',
        'dashicons-store',
        25
    );
}

function meraki_render_storefront_settings_page() {
    if (!current_user_can('manage_options')) return;

    $notice = '';
    if (isset($_POST['meraki_settings_nonce']) && wp_verify_nonce($_POST['meraki_settings_nonce'], 'meraki_save_settings')) {
        update_option('meraki_top_announcement', sanitize_text_field($_POST['meraki_top_announcement'] ?? ''));
        update_option('meraki_announcement_link', esc_url_raw($_POST['meraki_announcement_link'] ?? ''));
        update_option('meraki_active_coupon_code', sanitize_text_field($_POST['meraki_active_coupon_code'] ?? ''));
        update_option('meraki_marquee_text', sanitize_text_field($_POST['meraki_marquee_text'] ?? ''));
        update_option('meraki_homepage_categories', sanitize_text_field($_POST['meraki_homepage_categories'] ?? ''));
        update_option('meraki_whatsapp_number', sanitize_text_field($_POST['meraki_whatsapp_number'] ?? ''));
        update_option('meraki_whatsapp_greeting', sanitize_text_field($_POST['meraki_whatsapp_greeting'] ?? ''));
        update_option('meraki_support_phone', sanitize_text_field($_POST['meraki_support_phone'] ?? ''));
        update_option('meraki_support_email', sanitize_email($_POST['meraki_support_email'] ?? ''));
        update_option('meraki_store_address', sanitize_textarea_field($_POST['meraki_store_address'] ?? ''));
        update_option('meraki_working_hours', sanitize_text_field($_POST['meraki_working_hours'] ?? ''));
        update_option('meraki_instagram_url', esc_url_raw($_POST['meraki_instagram_url'] ?? ''));

        meraki_trigger_frontend_revalidation(array('/', '/shop', '/contact'));
        $notice = '<div class="notice notice-success is-dismissible"><p><strong>Settings saved successfully!</strong> Next.js frontend cache purged for homepage and catalog.</p></div>';
    }

    $top_announcement = get_option('meraki_top_announcement', 'MINIMUM ORDER RS. 300 | 100% AUTHENTIC ART MATERIALS | PAN INDIA DELIVERY');
    $announcement_link = get_option('meraki_announcement_link', '/shop');
    $active_coupon = get_option('meraki_active_coupon_code', '');
    $marquee_text = get_option('meraki_marquee_text', 'MINIMUM ORDER RS. 300 | FREE SHIPPING ON ORDERS ABOVE RS. 3,000 | 100% AUTHENTIC RESIN ART MATERIALS');
    $homepage_cats = get_option('meraki_homepage_categories', 'silicone-and-resin-molds, bezels, dried-flowers, rings, metal-stands');
    $whatsapp_num = get_option('meraki_whatsapp_number', '917426915251');
    $whatsapp_greet = get_option('meraki_whatsapp_greeting', 'Hello Meraki Artencial Store!');
    $support_phone = get_option('meraki_support_phone', '+91 74269 15251');
    $support_email = get_option('meraki_support_email', 'merakiartstore@gmail.com');
    $store_address = get_option('meraki_store_address', 'Udaipur, Rajasthan, India - 313001');
    $working_hours = get_option('meraki_working_hours', 'Mon - Sat: 10:00 AM - 7:00 PM IST');
    $instagram_url = get_option('meraki_instagram_url', 'https://www.instagram.com/merakiartencialstore/');
    ?>
    <div class="wrap">
        <h1>⚡ Meraki Storefront Manager & Headless Settings</h1>
        <p>Manage announcements, hero categories, contact details, and headless storefront configurations. Changes auto-purge Next.js edge cache.</p>
        <?php echo $notice; ?>
        <form method="post" action="">
            <?php wp_nonce_field('meraki_save_settings', 'meraki_settings_nonce'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="meraki_homepage_categories">Homepage Featured Categories</label></th>
                    <td>
                        <input name="meraki_homepage_categories" type="text" id="meraki_homepage_categories" value="<?php echo esc_attr($homepage_cats); ?>" class="large-text" />
                        <p class="description">Comma-separated category slugs to show on the homepage (e.g. <code>silicone-and-resin-molds, bezels, dried-flowers, rings</code>). Admin can change order and list anytime.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_top_announcement">Top Announcement Bar</label></th>
                    <td>
                        <input name="meraki_top_announcement" type="text" id="meraki_top_announcement" value="<?php echo esc_attr($top_announcement); ?>" class="large-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_announcement_link">Announcement Link</label></th>
                    <td>
                        <input name="meraki_announcement_link" type="text" id="meraki_announcement_link" value="<?php echo esc_attr($announcement_link); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_active_coupon_code">Active Coupon Code</label></th>
                    <td>
                        <input name="meraki_active_coupon_code" type="text" id="meraki_active_coupon_code" value="<?php echo esc_attr($active_coupon); ?>" class="regular-text" placeholder="e.g. MERAKI10" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_marquee_text">Scrolling Marquee Ribbon Text</label></th>
                    <td>
                        <input name="meraki_marquee_text" type="text" id="meraki_marquee_text" value="<?php echo esc_attr($marquee_text); ?>" class="large-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_whatsapp_number">WhatsApp Number</label></th>
                    <td>
                        <input name="meraki_whatsapp_number" type="text" id="meraki_whatsapp_number" value="<?php echo esc_attr($whatsapp_num); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_whatsapp_greeting">WhatsApp Message</label></th>
                    <td>
                        <input name="meraki_whatsapp_greeting" type="text" id="meraki_whatsapp_greeting" value="<?php echo esc_attr($whatsapp_greet); ?>" class="large-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_support_phone">Customer Support Phone</label></th>
                    <td>
                        <input name="meraki_support_phone" type="text" id="meraki_support_phone" value="<?php echo esc_attr($support_phone); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_support_email">Customer Support Email</label></th>
                    <td>
                        <input name="meraki_support_email" type="email" id="meraki_support_email" value="<?php echo esc_attr($support_email); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_store_address">Store Location & Address</label></th>
                    <td>
                        <textarea name="meraki_store_address" id="meraki_store_address" rows="3" class="large-text"><?php echo esc_textarea($store_address); ?></textarea>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_working_hours">Store Working Hours</label></th>
                    <td>
                        <input name="meraki_working_hours" type="text" id="meraki_working_hours" value="<?php echo esc_attr($working_hours); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="meraki_instagram_url">Official Instagram URL</label></th>
                    <td>
                        <input name="meraki_instagram_url" type="url" id="meraki_instagram_url" value="<?php echo esc_attr($instagram_url); ?>" class="large-text" />
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Storefront Settings & Purge Cache'); ?>
        </form>
    </div>
    <?php
}


// =============================================================================
// 2. HEADLESS ISR CACHE PURGING (VERCEL QUOTA PROTECTION)
// =============================================================================

/**
 * Triggers non-blocking background ping to Next.js /api/revalidate.
 */
function meraki_trigger_frontend_revalidation($paths = array('/')) {
    $frontend_url = rtrim(MERAKI_FRONTEND_URL, '/');
    $secret       = MERAKI_REVALIDATION_SECRET;
    
    if (empty($frontend_url) || empty($secret)) return;

    foreach ((array) $paths as $path) {
        $endpoint = $frontend_url . '/api/revalidate?secret=' . urlencode($secret) . '&path=' . urlencode($path);
        wp_remote_post($endpoint, array(
            'timeout'   => 2,
            'blocking'  => false, // Non-blocking: will not freeze WP admin saves
            'sslverify' => false,
            'headers'   => array('X-Triggered-By' => 'WordPress-Bridge'),
        ));
    }
}

// Hook into WordPress post save / delete events
add_action('save_post', 'meraki_on_post_save_revalidate', 20, 2);
function meraki_on_post_save_revalidate($post_id, $post) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id)) return;
    if (!in_array($post->post_status, array('publish', 'trash'))) return;

    $paths = array('/');
    if ($post->post_type === 'product') {
        $paths[] = '/shop';
        $paths[] = '/product/' . $post->post_name;
    } elseif ($post->post_type === 'post') {
        $paths[] = '/blog';
        $paths[] = '/blog/' . $post->post_name;
    } elseif ($post->post_type === 'page') {
        $paths[] = '/' . $post->post_name;
    } elseif ($post->post_type === 'meraki_banner') {
        $paths[] = '/';
        $paths[] = '/shop';
    }

    meraki_trigger_frontend_revalidation($paths);
}

// Hook into ACF save post
add_action('acf/save_post', 'meraki_on_acf_save_revalidate', 20);
function meraki_on_acf_save_revalidate($post_id) {
    meraki_trigger_frontend_revalidation(array('/', '/shop', '/contact'));
}

// Add ⚡ Sync Frontend Cache button inside WordPress Admin Bar
add_action('admin_bar_menu', 'meraki_add_sync_cache_admin_bar', 100);
function meraki_add_sync_cache_admin_bar($admin_bar) {
    if (!current_user_can('manage_options')) return;

    $admin_bar->add_node(array(
        'id'    => 'meraki_sync_frontend_cache',
        'title' => '<span class="ab-icon dashicons dashicons-update" style="top:2px;"></span>⚡ Sync Frontend Cache',
        'href'  => wp_nonce_url(admin_url('admin-post.php?action=meraki_manual_sync_cache'), 'meraki_sync_cache_nonce'),
        'meta'  => array(
            'title' => 'Purge edge cache on Next.js frontend (ISR Revalidation)',
        ),
    ));
}

// Handle Admin Bar Button Click
add_action('admin_post_meraki_manual_sync_cache', 'meraki_handle_manual_sync_cache');
function meraki_handle_manual_sync_cache() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized access.');
    }
    check_admin_referer('meraki_sync_cache_nonce');

    meraki_trigger_frontend_revalidation(array('/', '/shop', '/blog', '/contact'));
    
    // Redirect back with notification query flag
    $redirect = add_query_arg('meraki_cache_synced', '1', wp_get_referer() ?: admin_url());
    wp_safe_redirect($redirect);
    exit;
}

// Admin Notice after Cache Sync
add_action('admin_notices', function () {
    if (!empty($_GET['meraki_cache_synced'])) {
        echo '<div class="notice notice-success is-dismissible"><p><strong>⚡ Success:</strong> Next.js frontend ISR cache revalidation triggered successfully!</p></div>';
    }
});

// =============================================================================
// 3. HEADLESS CUSTOMER AUTH & EMAIL OTP ENGINE (/screwnet/v1/auth/*)
// =============================================================================

add_action('rest_api_init', function () {
    // 3.1 Send Verification OTP Code
    register_rest_route('screwnet/v1', '/auth/send-verification-code', array(
        'methods'             => 'POST',
        'callback'            => 'screwnet_send_verification_code',
        'permission_callback' => '__return_true',
    ));

    // 3.2 Verify Code & Authenticate / Register Customer
    register_rest_route('screwnet/v1', '/auth/verify-code', array(
        'methods'             => 'POST',
        'callback'            => 'screwnet_verify_code',
        'permission_callback' => '__return_true',
    ));

    // 3.3 Get Current Customer Profile & Orders
    register_rest_route('screwnet/v1', '/auth/me', array(
        'methods'             => 'GET',
        'callback'            => 'screwnet_get_customer_profile',
        'permission_callback' => '__return_true',
    ));

    // 3.4 Update Customer Addresses
    register_rest_route('screwnet/v1', '/auth/update-address', array(
        'methods'             => 'POST',
        'callback'            => 'screwnet_update_customer_address',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Generate & send 6-digit email OTP.
 */
function screwnet_send_verification_code(WP_REST_Request $request) {
    $email = sanitize_email($request->get_param('email'));
    if (!is_email($email)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Valid email address is required.'), 400);
    }

    $transient_key = 'screwnet_otp_' . md5($email);
    $throttle_key  = 'screwnet_otp_throt_' . md5($email);

    if (get_transient($throttle_key)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Please wait 60 seconds before requesting another code.'), 429);
    }

    // Generate secure 6-digit numeric OTP
    $code = (string) random_int(100000, 999999);
    set_transient($transient_key, $code, 15 * MINUTE_IN_SECONDS); // 15-minute expiry
    set_transient($throttle_key, '1', 60); // 60-second cooldown

    // Branded HTML Email Template
    $site_name = MERAKI_STORE_NAME;
    $subject   = "Your Verification Code: {$code} - {$site_name}";
    
    $message = '<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;margin:0;padding:24px;background-color:#f4f4f5;color:#18181b;">'
        . '<div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:12px;padding:32px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">'
        . '<div style="text-align:center;margin-bottom:24px;">'
        . '<h2 style="margin:0;font-size:22px;letter-spacing:-0.5px;color:#000000;font-weight:700;">' . esc_html($site_name) . '</h2>'
        . '<p style="margin:6px 0 0;font-size:13px;color:#71717a;">Customer Authentication & Secure Login</p>'
        . '</div>'
        . '<p style="font-size:15px;line-height:1.5;margin-bottom:20px;">Hello,</p>'
        . '<p style="font-size:15px;line-height:1.5;margin-bottom:24px;">Use the 6-digit verification code below to sign in or confirm your account. This code is valid for <strong>15 minutes</strong>.</p>'
        . '<div style="background:#000000;color:#ffffff;text-align:center;padding:18px 24px;border-radius:8px;font-size:32px;letter-spacing:8px;font-weight:800;font-family:monospace;margin:24px 0;">' . esc_html($code) . '</div>'
        . '<p style="font-size:13px;color:#71717a;line-height:1.5;margin-top:24px;">If you did not request this verification code, you can safely ignore this email. Never share this code with anyone.</p>'
        . '<hr style="border:none;border-top:1px solid #f4f4f5;margin:24px 0;" />'
        . '<p style="font-size:11px;color:#a1a1aa;text-align:center;margin:0;">&copy; ' . date('Y') . ' ' . esc_html($site_name) . '. All rights reserved.</p>'
        . '</div></body></html>';

    $headers = array('Content-Type: text/html; charset=UTF-8');
    $sent = wp_mail($email, $subject, $message, $headers);

    if (!$sent) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Failed to dispatch verification email. Please check server email settings.'), 500);
    }

    return new WP_REST_Response(array(
        'success' => true,
        'message' => "Verification code sent to {$email}.",
        'expiresIn' => 900,
    ), 200);
}

/**
 * Verify OTP & authenticate / create customer.
 */
function screwnet_verify_code(WP_REST_Request $request) {
    $email = sanitize_email($request->get_param('email'));
    $code  = sanitize_text_field($request->get_param('code'));

    if (empty($email) || empty($code)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Email and code are required.'), 400);
    }

    $transient_key = 'screwnet_otp_' . md5($email);
    $stored_code   = get_transient($transient_key);

    if (!$stored_code || (string) $stored_code !== (string) $code) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Invalid or expired verification code.'), 400);
    }

    // OTP verified: delete transient
    delete_transient($transient_key);

    // Fetch or create customer
    $user = get_user_by('email', $email);
    if (!$user) {
        $username = sanitize_user(current(explode('@', $email)));
        $i = 1;
        while (username_exists($username)) {
            $username = sanitize_user(current(explode('@', $email))) . $i;
            $i++;
        }
        $password = wp_generate_password(24, true, true);
        $user_id  = wp_create_user($username, $password, $email);
        if (is_wp_error($user_id)) {
            return new WP_REST_Response(array('success' => false, 'message' => $user_id->get_error_message()), 500);
        }
        $user = get_user_by('id', $user_id);
        $user->set_role('customer');
    } else {
        $user_id = $user->ID;
    }

    // Set verified flag
    update_user_meta($user_id, '_customer_email_verified', 'yes');

    // Generate secure customer token (User ID + Hash + Expiry)
    $token = screwnet_generate_customer_token($user);

    return new WP_REST_Response(array(
        'success'  => true,
        'message'  => 'Verification successful.',
        'token'    => $token,
        'customer' => screwnet_format_customer_data($user),
    ), 200);
}

/**
 * Generate customer token.
 */
function screwnet_generate_customer_token($user) {
    $issued_at = time();
    $salt      = wp_salt('auth');
    $signature = hash_hmac('sha256', $user->ID . '|' . $issued_at . '|' . $user->user_pass, $salt);
    return base64_encode($user->ID . ':' . $issued_at . ':' . $signature);
}

/**
 * Validate customer token.
 */
function screwnet_validate_customer_token($token) {
    if (empty($token)) return false;
    $decoded = base64_decode($token);
    if (!$decoded || strpos($decoded, ':') === false) return false;

    $parts = explode(':', $decoded);
    if (count($parts) !== 3) return false;

    list($user_id, $issued_at, $signature) = $parts;
    $user = get_user_by('id', (int) $user_id);
    if (!$user) return false;

    // Token expires after 30 days
    if (time() - (int) $issued_at > 30 * DAY_IN_SECONDS) return false;

    $salt               = wp_salt('auth');
    $expected_signature = hash_hmac('sha256', $user->ID . '|' . $issued_at . '|' . $user->user_pass, $salt);
    if (!hash_equals($expected_signature, $signature)) return false;

    return $user;
}

/**
 * Get current customer profile & orders.
 */
function screwnet_get_customer_profile(WP_REST_Request $request) {
    $token = $request->get_header('X-Customer-Token') ?: str_replace('Bearer ', '', $request->get_header('Authorization') ?: '');
    $user  = screwnet_validate_customer_token($token);

    if (!$user) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Unauthorized or expired session.'), 401);
    }

    $orders = array();
    if (function_exists('wc_get_orders')) {
        $wc_orders = wc_get_orders(array(
            'customer' => $user->ID,
            'limit'    => 20,
            'orderby'  => 'date',
            'order'    => 'DESC',
        ));

        foreach ($wc_orders as $o) {
            $items = array();
            foreach ($o->get_items() as $item) {
                $product = $item->get_product();
                $items[] = array(
                    'id'       => $item->get_id(),
                    'name'     => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'total'    => (float) $item->get_total(),
                    'image'    => $product ? wp_get_attachment_url($product->get_image_id()) : null,
                );
            }

            $tracking = screwnet_extract_order_tracking($o->get_id());

            $orders[] = array(
                'id'           => $o->get_id(),
                'status'       => $o->get_status(),
                'statusLabel'  => wc_get_order_status_name($o->get_status()),
                'total'        => (float) $o->get_total(),
                'currency'     => $o->get_currency(),
                'dateCreated'  => $o->get_date_created() ? $o->get_date_created()->format('Y-m-d H:i:s') : null,
                'items'        => $items,
                'tracking'     => $tracking,
            );
        }
    }

    return new WP_REST_Response(array(
        'success'  => true,
        'customer' => screwnet_format_customer_data($user),
        'orders'   => $orders,
    ), 200);
}

/**
 * Update Customer Addresses.
 */
function screwnet_update_customer_address(WP_REST_Request $request) {
    $token = $request->get_header('X-Customer-Token') ?: str_replace('Bearer ', '', $request->get_header('Authorization') ?: '');
    $user  = screwnet_validate_customer_token($token);

    if (!$user) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Unauthorized or expired session.'), 401);
    }

    $billing  = (array) $request->get_param('billing');
    $shipping = (array) $request->get_param('shipping');

    $allowed_fields = array('first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'phone', 'email');

    foreach ($allowed_fields as $field) {
        if (isset($billing[$field])) {
            update_user_meta($user->ID, 'billing_' . $field, sanitize_text_field($billing[$field]));
        }
        if (isset($shipping[$field])) {
            update_user_meta($user->ID, 'shipping_' . $field, sanitize_text_field($shipping[$field]));
        }
    }

    return new WP_REST_Response(array(
        'success'  => true,
        'message'  => 'Addresses updated successfully.',
        'customer' => screwnet_format_customer_data($user),
    ), 200);
}

function screwnet_format_customer_data($user) {
    return array(
        'id'            => $user->ID,
        'email'         => $user->user_email,
        'username'      => $user->user_login,
        'firstName'     => get_user_meta($user->ID, 'first_name', true) ?: get_user_meta($user->ID, 'billing_first_name', true),
        'lastName'      => get_user_meta($user->ID, 'last_name', true) ?: get_user_meta($user->ID, 'billing_last_name', true),
        'isVerified'    => get_user_meta($user->ID, '_customer_email_verified', true) === 'yes',
        'billing'       => array(
            'firstName' => get_user_meta($user->ID, 'billing_first_name', true),
            'lastName'  => get_user_meta($user->ID, 'billing_last_name', true),
            'company'   => get_user_meta($user->ID, 'billing_company', true),
            'address1'  => get_user_meta($user->ID, 'billing_address_1', true),
            'address2'  => get_user_meta($user->ID, 'billing_address_2', true),
            'city'      => get_user_meta($user->ID, 'billing_city', true),
            'state'     => get_user_meta($user->ID, 'billing_state', true),
            'postcode'  => get_user_meta($user->ID, 'billing_postcode', true),
            'country'   => get_user_meta($user->ID, 'billing_country', true) ?: 'IN',
            'email'     => get_user_meta($user->ID, 'billing_email', true) ?: $user->user_email,
            'phone'     => get_user_meta($user->ID, 'billing_phone', true),
        ),
        'shipping'      => array(
            'firstName' => get_user_meta($user->ID, 'shipping_first_name', true),
            'lastName'  => get_user_meta($user->ID, 'shipping_last_name', true),
            'company'   => get_user_meta($user->ID, 'shipping_company', true),
            'address1'  => get_user_meta($user->ID, 'shipping_address_1', true),
            'address2'  => get_user_meta($user->ID, 'shipping_address_2', true),
            'city'      => get_user_meta($user->ID, 'shipping_city', true),
            'state'     => get_user_meta($user->ID, 'shipping_state', true),
            'postcode'  => get_user_meta($user->ID, 'shipping_postcode', true),
            'country'   => get_user_meta($user->ID, 'shipping_country', true) ?: 'IN',
            'phone'     => get_user_meta($user->ID, 'shipping_phone', true),
        ),
    );
}

// =============================================================================
// 4. LIVE ORDER TRACKING (ADVANCED SHIPMENT TRACKING - AST SYNC)
// =============================================================================

add_action('rest_api_init', function () {
    register_rest_route('screwnet/v1', '/track-order', array(
        'methods'             => array('GET', 'POST'),
        'callback'            => 'screwnet_track_order_endpoint',
        'permission_callback' => '__return_true',
    ));
});

function screwnet_track_order_endpoint(WP_REST_Request $request) {
    $order_id   = absint($request->get_param('order_id') ?: $request->get_param('orderId'));
    $identifier = trim(sanitize_text_field($request->get_param('identifier') ?: $request->get_param('email') ?: $request->get_param('phone')));

    if (!$order_id || empty($identifier)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Both Order Number and Billing Email/Phone are required.'), 400);
    }

    if (!function_exists('wc_get_order')) {
        return new WP_REST_Response(array('success' => false, 'message' => 'WooCommerce is not active.'), 500);
    }

    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_REST_Response(array('success' => false, 'message' => 'No order found with the provided details.'), 404);
    }

    // Verify identifier against billing_email or billing_phone
    $billing_email = strtolower(trim($order->get_billing_email()));
    $billing_phone = preg_replace('/\D+/', '', $order->get_billing_phone());
    $clean_ident   = preg_replace('/\D+/', '', $identifier);

    $is_email_match = (strpos($identifier, '@') !== false && strtolower($identifier) === $billing_email);
    $is_phone_match = (!empty($billing_phone) && !empty($clean_ident) && substr($billing_phone, -10) === substr($clean_ident, -10));

    if (!$is_email_match && !$is_phone_match) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Order details do not match our records.'), 403);
    }

    $status   = $order->get_status();
    $tracking = screwnet_extract_order_tracking($order_id);

    // Calculate 4-Step Progress:
    // Step 1: Confirmed
    // Step 2: Processing & Packaging
    // Step 3: Dispatched & In Transit
    // Step 4: Delivered
    $current_step = 1;
    if (in_array($status, array('processing', 'on-hold'))) {
        $current_step = 2;
    } elseif (!empty($tracking['trackingNumber']) || in_array($status, array('shipped', 'in-transit'))) {
        $current_step = 3;
    } elseif (in_array($status, array('completed', 'delivered'))) {
        $current_step = 4;
    } elseif (in_array($status, array('cancelled', 'failed', 'refunded'))) {
        $current_step = 0; // Special exception status
    }

    $steps = array(
        array('step' => 1, 'name' => 'Order Confirmed', 'desc' => 'Order placed and payment verified', 'completed' => $current_step >= 1),
        array('step' => 2, 'name' => 'Processing & Packaging', 'desc' => 'Handcrafted items being prepared and packed', 'completed' => $current_step >= 2),
        array('step' => 3, 'name' => 'Dispatched & In Transit', 'desc' => 'Handed over to courier partner for delivery', 'completed' => $current_step >= 3),
        array('step' => 4, 'name' => 'Delivered', 'desc' => 'Delivered to your doorstep', 'completed' => $current_step >= 4),
    );

    $items = array();
    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $items[] = array(
            'name'     => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'total'    => (float) $item->get_total(),
            'image'    => $product ? wp_get_attachment_url($product->get_image_id()) : null,
        );
    }

    return new WP_REST_Response(array(
        'success'      => true,
        'orderId'      => $order->get_id(),
        'orderNumber'  => $order->get_order_number(),
        'status'       => $status,
        'statusLabel'  => wc_get_order_status_name($status),
        'dateCreated'  => $order->get_date_created() ? $order->get_date_created()->format('d M Y, h:i A') : '',
        'total'        => (float) $order->get_total(),
        'currency'     => $order->get_currency(),
        'currentStep'  => $current_step,
        'steps'        => $steps,
        'tracking'     => $tracking,
        'shipping'     => array(
            'name'     => trim($order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name()) ?: trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
            'city'     => $order->get_shipping_city() ?: $order->get_billing_city(),
            'state'    => $order->get_shipping_state() ?: $order->get_billing_state(),
            'postcode' => $order->get_shipping_postcode() ?: $order->get_billing_postcode(),
        ),
        'items'        => $items,
    ), 200);
}

/**
 * Helper to extract Advanced Shipment Tracking (AST) metadata.
 */
function screwnet_extract_order_tracking($order_id) {
    $tracking_data = array(
        'hasTracking'    => false,
        'provider'       => '',
        'trackingNumber' => '',
        'trackingUrl'    => '',
        'dispatchDate'   => '',
    );

    // 1. Check AST meta: _wc_shipment_tracking_items
    $ast_items = get_post_meta($order_id, '_wc_shipment_tracking_items', true);
    if (!empty($ast_items) && is_array($ast_items)) {
        $first = reset($ast_items);
        $provider        = !empty($first['tracking_provider']) ? $first['tracking_provider'] : (!empty($first['custom_tracking_provider']) ? $first['custom_tracking_provider'] : '');
        $tracking_number = !empty($first['tracking_number']) ? $first['tracking_number'] : '';
        $tracking_url    = !empty($first['custom_tracking_link']) ? $first['custom_tracking_link'] : (!empty($first['formatted_tracking_link']) ? $first['formatted_tracking_link'] : '');
        $date_shipped    = !empty($first['date_shipped']) ? date('d M Y', $first['date_shipped']) : '';

        if (!empty($tracking_number)) {
            $tracking_data['hasTracking']    = true;
            $tracking_data['provider']       = $provider ?: 'Courier Partner';
            $tracking_data['trackingNumber'] = $tracking_number;
            $tracking_data['dispatchDate']   = $date_shipped;
            $tracking_data['trackingUrl']    = $tracking_url ?: screwnet_build_courier_url($provider, $tracking_number);
            return $tracking_data;
        }
    }

    // 2. Generic fallback meta
    $alt_number = get_post_meta($order_id, '_tracking_number', true) ?: get_post_meta($order_id, 'tracking_number', true);
    $alt_provider = get_post_meta($order_id, '_tracking_provider', true) ?: get_post_meta($order_id, 'courier_name', true);
    if ($alt_number) {
        $tracking_data['hasTracking']    = true;
        $tracking_data['provider']       = $alt_provider ?: 'Courier';
        $tracking_data['trackingNumber'] = $alt_number;
        $tracking_data['trackingUrl']    = screwnet_build_courier_url($alt_provider, $alt_number);
    }

    return $tracking_data;
}

/**
 * Generate Direct Tracking URL for Indian & Global Couriers.
 */
function screwnet_build_courier_url($provider, $tracking_number) {
    $p = strtolower($provider);
    $t = urlencode(trim($tracking_number));

    if (strpos($p, 'delhivery') !== false) {
        return "https://www.delhivery.com/track/package/{$t}";
    } elseif (strpos($p, 'bluedart') !== false || strpos($p, 'blue dart') !== false) {
        return "https://www.bluedart.com/tracking?trackNumber={$t}";
    } elseif (strpos($p, 'dtdc') !== false) {
        return "https://www.dtdc.in/tracking/shipment-tracking.asp?trackingNumber={$t}";
    } elseif (strpos($p, 'india post') !== false || strpos($p, 'speed post') !== false) {
        return "https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx";
    } elseif (strpos($p, 'shiprocket') !== false) {
        return "https://shiprocket.co/tracking/{$t}";
    } elseif (strpos($p, 'shadowfax') !== false) {
        return "https://tracker.shadowfax.in/#/track/{$t}";
    } elseif (strpos($p, 'xpressbees') !== false) {
        return "https://www.xpressbees.com/track?awb={$t}";
    }

    return "https://www.google.com/search?q=" . urlencode("track shipment " . $provider . " " . $tracking_number);
}

// =============================================================================
// 5. WORDPRESS ADMIN WHITE-LABELING & SUBDOMAIN ROUTING
// =============================================================================

// 5.1 Subdomain Frontend Route Redirection
add_action('template_redirect', 'meraki_subdomain_routing_redirect');
function meraki_subdomain_routing_redirect() {
    if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST)) return;

    $request_uri = $_SERVER['REQUEST_URI'] ?? '';

    // If customer visits /my-account on WordPress subdomain, 301-redirect to Next.js /account
    if (strpos($request_uri, '/my-account') !== false) {
        wp_redirect(rtrim(MERAKI_FRONTEND_URL, '/') . '/account', 301);
        exit;
    }

    // If visitor visits frontend home or shop on backend domain, redirect to frontend storefront
    if (is_front_page() || is_shop() || is_product() || is_product_category()) {
        wp_redirect(MERAKI_FRONTEND_URL, 301);
        exit;
    }
}

// 5.2 White-Label wp-login.php with Official Brand Logo & Monochrome Aesthetic
add_action('login_enqueue_scripts', 'meraki_brand_login_page_styling');
function meraki_brand_login_page_styling() {
    ?>
    <style type="text/css">
        body.login {
            background-color: #f8fafc !important;
            color: #09090b !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        #login h1 a, .login h1 a {
            background-image: url('https://merakiartencialstore.com/images/meraki-logo.svg'), url('https://merakiartencialstore.com/wp-content/uploads/2024/logo.png') !important;
            background-repeat: no-repeat !important;
            background-size: contain !important;
            background-position: center !important;
            width: 220px !important;
            height: 60px !important;
            margin-bottom: 20px !important;
        }
        .login form {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04) !important;
            padding: 30px 24px !important;
        }
        .login label {
            font-weight: 500 !important;
            color: #09090b !important;
            font-size: 13px !important;
        }
        .login input[type="text"], .login input[type="password"] {
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            padding: 8px 12px !important;
            font-size: 14px !important;
            transition: border-color 0.2s ease !important;
        }
        .login input[type="text"]:focus, .login input[type="password"]:focus {
            border-color: #000000 !important;
            box-shadow: 0 0 0 1px #000000 !important;
        }
        .wp-core-ui .button-primary {
            background: #000000 !important;
            border-color: #000000 !important;
            color: #ffffff !important;
            font-weight: 600 !important;
            border-radius: 6px !important;
            text-shadow: none !important;
            padding: 4px 18px !important;
            transition: opacity 0.2s ease !important;
        }
        .wp-core-ui .button-primary:hover, .wp-core-ui .button-primary:focus {
            background: #27272a !important;
            border-color: #27272a !important;
            opacity: 0.9 !important;
        }
        .login #backtoblog a, .login #nav a {
            color: #64748b !important;
            font-size: 13px !important;
        }
        .login #backtoblog a:hover, .login #nav a:hover {
            color: #000000 !important;
        }
    </style>
    <?php
}

// Change Login Logo URL to Main Next.js Storefront
add_filter('login_headerurl', function () {
    return MERAKI_FRONTEND_URL;
});

add_filter('login_headertext', function () {
    return MERAKI_STORE_NAME;
});

// Remove Default WordPress Logo from Top Admin Bar
add_action('wp_before_admin_bar_render', function () {
    global $wp_admin_bar;
    if ($wp_admin_bar) {
        $wp_admin_bar->remove_menu('wp-logo');
    }
}, 0);

// =============================================================================
// 6. CENTRALIZED TRANSACTIONAL EMAIL CONFIGURATION
// =============================================================================

add_filter('wp_mail_from', function ($original_email) {
    return MERAKI_SUPPORT_EMAIL;
});

add_filter('wp_mail_from_name', function ($original_name) {
    return MERAKI_STORE_NAME;
});
