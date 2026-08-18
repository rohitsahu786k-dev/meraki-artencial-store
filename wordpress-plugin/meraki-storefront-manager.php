<?php
/**
 * Plugin Name: Meraki Storefront Manager
 * Plugin URI: https://merakiartencialstore.com
 * Description: Custom post types and REST API endpoints for managing Meraki Hero Banners, Announcement Bar, WhatsApp contact details, and offers.
 * Version: 1.0.0
 * Author: Meraki Artencial Store
 * Text Domain: meraki-store
 */

if (!defined('ABSPATH')) exit;

// 1. Register Custom Post Type: Hero Banners
add_action('init', 'meraki_register_post_types');
function meraki_register_post_types() {
    $labels = array(
        'name'                  => 'Hero Banners',
        'singular_name'         => 'Hero Banner',
        'menu_name'             => 'Hero Banners',
        'name_admin_bar'        => 'Hero Banner',
        'add_new'               => 'Add New Banner',
        'add_new_item'          => 'Add New Hero Banner',
        'new_item'              => 'New Hero Banner',
        'edit_item'             => 'Edit Hero Banner',
        'view_item'             => 'View Hero Banner',
        'all_items'             => 'All Banners',
        'search_items'          => 'Search Banners',
        'not_found'             => 'No banners found',
        'not_found_in_trash'    => 'No banners found in Trash',
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

// 2. Register ACF Fields for Hero Banners Post Type
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
                'instructions' => 'Recommended: 800x800px or 1080x1350px (Optional: falls back to Desktop Image if empty)',
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
                'instructions' => 'Where should clicking this banner navigate? (e.g. /shop, /category/bezels, https://...)',
                'default_value' => '/shop',
                'placeholder' => '/shop',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_banner_subtitle',
                'label' => 'Banner Subtitle / Promotional Tag',
                'name' => 'subtitle',
                'type' => 'text',
                'instructions' => 'Short promotional text (optional)',
                'placeholder' => 'e.g. Up to 30% OFF on Korean Jewellery',
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

    // Field Group for Storefront Settings (Front Page / Options)
    acf_add_local_field_group(array(
        'key' => 'group_meraki_storefront_settings',
        'title' => 'Storefront Announcements, Offers & Contact Details',
        'fields' => array(
            // Tab 1: Announcements & Offers
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
                'default_value' => 'MINIMUM ORDER RS. 300 | SECURE NIMBBL CHECKOUT | PAN INDIA DELIVERY',
                'instructions' => 'Header top notification bar message',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_announcement_link',
                'label' => 'Announcement Click Link',
                'name' => 'announcement_link',
                'type' => 'text',
                'default_value' => '/shop?on_sale=true',
                'instructions' => 'Link when clicking top announcement bar',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_marquee_text',
                'label' => 'Homepage Scrolling Ribbon Text',
                'name' => 'marquee_text',
                'type' => 'text',
                'default_value' => 'MINIMUM ORDER RS. 300 | FREE SHIPPING ON ORDERS ABOVE RS. 3,000 | 100% AUTHENTIC RESIN ART MATERIALS',
                'instructions' => 'Scrolling text ticker below the hero carousel',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_active_coupon',
                'label' => 'Featured Offer / Coupon Code',
                'name' => 'active_coupon_code',
                'type' => 'text',
                'placeholder' => 'e.g. MERAKI10',
                'instructions' => 'Highlighted discount code in header/announcement',
                'show_in_rest' => 1,
            ),
            // Tab 2: Contact Details & WhatsApp
            array(
                'key' => 'tab_meraki_contact',
                'label' => '💬 WhatsApp & Contact Details',
                'type' => 'tab',
            ),
            array(
                'key' => 'field_meraki_whatsapp_number',
                'label' => 'WhatsApp Number (with Country Code)',
                'name' => 'whatsapp_number',
                'type' => 'text',
                'default_value' => '917426915251',
                'instructions' => 'e.g. 917426915251 (used for WhatsApp 1-click chat button)',
                'show_in_rest' => 1,
            ),
            array(
                'key' => 'field_meraki_whatsapp_message',
                'label' => 'WhatsApp Default Greeting Message',
                'name' => 'whatsapp_greeting',
                'type' => 'text',
                'default_value' => 'Hello Meraki Artencial Store! I would like to inquire about your resin art materials and jewellery collection.',
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
}

// 3. Register Custom Clean REST API Endpoint: /wp-json/meraki/v1/store-data
add_action('rest_api_init', function () {
    register_rest_route('meraki/v1', '/store-data', array(
        'methods'  => 'GET',
        'callback' => 'meraki_get_store_data',
        'permission_callback' => '__return_true',
    ));
});

function meraki_get_store_data() {
    $front_page_id = get_option('page_on_front') ?: 5826;
    
    // Fetch Hero Banners from CPT
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
        $mobile = get_field('mobile_image', $b->ID) ?: $desktop;
        $link = get_field('link', $b->ID) ?: '/shop';
        $active = get_field('is_active', $b->ID);
        
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

    return array(
        'banners' => $banners,
        'announcement' => array(
            'text'   => get_field('top_announcement', $front_page_id) ?: 'MINIMUM ORDER RS. 300 | SECURE NIMBBL CHECKOUT | PAN INDIA DELIVERY',
            'link'   => get_field('announcement_link', $front_page_id) ?: '/shop',
            'coupon' => get_field('active_coupon_code', $front_page_id) ?: '',
        ),
        'marquee' => get_field('marquee_text', $front_page_id) ?: 'MINIMUM ORDER RS. 300 | FREE SHIPPING ON ORDERS ABOVE RS. 3,000 | 100% AUTHENTIC RESIN ART MATERIALS',
        'contact' => array(
            'whatsapp' => get_field('whatsapp_number', $front_page_id) ?: '917426915251',
            'greeting' => get_field('whatsapp_greeting', $front_page_id) ?: 'Hello Meraki Artencial Store!',
            'phone'    => get_field('support_phone', $front_page_id) ?: '+91 74269 15251',
            'email'    => get_field('support_email', $front_page_id) ?: 'merakiartstore@gmail.com',
            'address'  => get_field('store_address', $front_page_id) ?: 'Udaipur, Rajasthan, India',
        ),
    );
}
