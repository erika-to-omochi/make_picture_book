Devise.setup do |config|
  # メール送信者の設定
  config.mailer_sender = 'no-reply@yourdomain.com'

  require 'devise/orm/active_record'

  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = true
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete
  config.responder.error_status = :unprocessable_entity
  config.responder.redirect_status = :see_other

  # JWTの設定
  config.jwt do |jwt|
    jwt.secret = ENV['JWT_SECRET_KEY'] || Rails.application.credentials.dig(:jwt, :secret)
    jwt.dispatch_requests = [
      ['POST', %r{^/login$}]
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/logout$}]
    ]
    jwt.expiration_time = 1.day.to_i
  end

  # i18nの設定
  config.parent_controller = 'DeviseController'
end
