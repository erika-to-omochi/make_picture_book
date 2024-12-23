Devise.setup do |config|
  config.mailer_sender = 'no-reply@ehon-ga-pon.com'


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
  config.parent_controller = 'ApplicationController'

  # JWTの設定
  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.dig(:jwt, :secret)
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/sign_in$}]
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/sign_out$}]
    ]
    jwt.expiration_time = 1.day.to_i
    #jwt.revocation_strategy = JwtDenylist
  end

  # 非HTMLリクエストを弾いてしまうので、以下のように緩める
  config.navigational_formats = ['*/*', :html]

  # OmniAuthのパスプレフィックスを設定
  config.omniauth_path_prefix = '/api/v1/auth'

  # OmniAuthの設定
  config.omniauth :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {
    scope: 'userinfo.email, userinfo.profile',
    prompt: 'select_account',
    redirect_uri: 'http://localhost:3000/api/v1/auth/google_oauth2/callback',
    redirect_uri: 'https://ehon-ga-pon.com//api/v1/auth/google_oauth2/callback'
  }
end
