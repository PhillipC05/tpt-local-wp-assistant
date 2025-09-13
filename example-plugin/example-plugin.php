<?php
/**
 * Plugin Name: Example Plugin
 * Description: A simple example plugin for testing TPT Local WP Assistant
 * Version: 1.0.0
 * Author: TPT
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ExamplePlugin {
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('example_shortcode', array($this, 'example_shortcode'));
    }

    public function init() {
        // Plugin initialization
    }

    public function enqueue_scripts() {
        wp_enqueue_script('example-plugin-js', plugin_dir_url(__FILE__) . 'js/example.js', array('jquery'), '1.0.0', true);
        wp_enqueue_style('example-plugin-css', plugin_dir_url(__FILE__) . 'css/example.css', array(), '1.0.0');
    }

    public function example_shortcode($atts) {
        $atts = shortcode_atts(array(
            'message' => 'Hello from Example Plugin!'
        ), $atts);

        return '<div class="example-plugin-container"><p>' . esc_html($atts['message']) . '</p></div>';
    }
}

// Initialize the plugin
new ExamplePlugin();
