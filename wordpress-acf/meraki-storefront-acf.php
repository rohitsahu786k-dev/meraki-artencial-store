<?php
/**
 * Meraki Artencial Store - ACF Hero Banners & Storefront Settings
 * 
 * Instructions:
 * 1. Copy this code into your theme's functions.php file or create a plugin.
 * 2. Ensure Advanced Custom Fields (ACF) plugin is installed and activated.
 * 3. Go to Pages -> Edit "Home" (Front Page) in WordPress Admin.
 * 4. You will see a "Storefront Banners & Announcements" metabox to upload Desktop & Mobile banners and add links.
 */

if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group(array(
        'key' => 'group_meraki_hero_banners',
        'title' => 'Storefront Banners & Announcements',
        'fields' => array(
            // Top Announcement Text
            array(
                'key' => 'field_meraki_top_announcement',
                'label' => 'Top Announcement Bar Text',
                'name' => 'top_announcement',
                'type' => 'text',
                'instructions' => 'Appears at the very top of the website header.',
                'default_value' => 'Minimum order Rs. 300 | Secure Nimbbl checkout | Pan India delivery',
                'placeholder' => 'Enter announcement message...',
                'show_in_rest' => 1,
            ),
            // Marquee Ribbon Text
            array(
                'key' => 'field_meraki_marquee_text',
                'label' => 'Homepage Scrolling Marquee Text',
                'name' => 'marquee_text',
                'type' => 'text',
                'instructions' => 'Appears in the scrolling text ribbon below the hero slider.',
                'default_value' => 'MINIMUM ORDER RS. 300 | SECURE NIMBBL CHECKOUT | PAN INDIA DELIVERY | 100% AUTHENTIC RESIN ART MATERIALS',
                'placeholder' => 'Enter scrolling text...',
                'show_in_rest' => 1,
            ),
            // Hero Banners Repeater
            array(
                'key' => 'field_meraki_hero_banners',
                'label' => 'Hero Slider Banners',
                'name' => 'hero_banners',
                'type' => 'repeater',
                'instructions' => 'Add, reorder or remove homepage slider banners. Supports both Desktop and Phone/Mobile images.',
                'required' => 0,
                'show_in_rest' => 1,
                'layout' => 'block',
                'button_label' => 'Add New Banner',
                'sub_fields' => array(
                    array(
                        'key' => 'field_meraki_banner_desktop_image',
                        'label' => 'Desktop Banner Image',
                        'name' => 'desktop_image',
                        'type' => 'image',
                        'instructions' => 'Recommended size: 1920x600px or 1600x500px (JPG/WebP/PNG)',
                        'required' => 1,
                        'return_format' => 'url',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'show_in_rest' => 1,
                    ),
                    array(
                        'key' => 'field_meraki_banner_mobile_image',
                        'label' => 'Mobile Phone Banner Image',
                        'name' => 'mobile_image',
                        'type' => 'image',
                        'instructions' => 'Recommended size: 800x800px or 1080x1350px (optional, falls back to desktop image if left empty)',
                        'required' => 0,
                        'return_format' => 'url',
                        'preview_size' => 'medium',
                        'library' => 'all',
                        'show_in_rest' => 1,
                    ),
                    array(
                        'key' => 'field_meraki_banner_title',
                        'label' => 'Banner Title / Alt Text',
                        'name' => 'title',
                        'type' => 'text',
                        'instructions' => 'Promotion title or SEO alt text',
                        'placeholder' => 'e.g. Best Resin Art & Craft Material Store',
                        'show_in_rest' => 1,
                    ),
                    array(
                        'key' => 'field_meraki_banner_link',
                        'label' => 'Banner Click Link',
                        'name' => 'link',
                        'type' => 'text',
                        'instructions' => 'Where should clicking this banner go? (e.g. /shop, /category/bezels, https://...)',
                        'default_value' => '/shop',
                        'placeholder' => '/shop or /category/silicone-and-resin-molds',
                        'show_in_rest' => 1,
                    ),
                    array(
                        'key' => 'field_meraki_banner_active',
                        'label' => 'Active / Show on Website',
                        'name' => 'is_active',
                        'type' => 'true_false',
                        'default_value' => 1,
                        'ui' => 1,
                        'show_in_rest' => 1,
                    ),
                ),
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
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'active' => true,
        'show_in_rest' => true,
    ));
}
