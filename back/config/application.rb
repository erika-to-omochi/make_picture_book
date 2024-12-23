require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module App
  class Application < Rails::Application
    config.load_defaults 7.1
    config.autoload_lib(ignore: %w(assets tasks))
    config.api_only = true
    config.time_zone = "Tokyo"
    config.active_record.default_timezone = :local
    config.i18n.default_locale = :ja
    config.i18n.available_locales = [:en, :ja]
    config.session_store :cookie_store, key: '_ehon_ga_pon_session'
    config.middleware.insert_before 0, ActionDispatch::Cookies
    config.middleware.insert_before 1, ActionDispatch::Session::CookieStore, key: '_ehon_ga_pon_session'
  end
end
