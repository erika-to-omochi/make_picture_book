class Api::V1::Auth::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  skip_before_action :authenticate_user!

  def google_oauth2
    @user = User.from_omniauth(request.env['omniauth.auth'])
    if @user.persisted?
      refresh_token = @user.refresh_tokens.create!(expires_at: 7.days.from_now)
      access_token, _payload = Warden::JWTAuth::UserEncoder.new.call(@user, :user, nil)
      redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{access_token}&user_name=#{@user.name}", allow_other_host: true
    else
      session['devise.google_data'] = request.env['omniauth.auth'].except('extra')
      redirect_to new_user_registration_url, alert: @user.errors.full_messages.join("\n")
    end
  end

  def failure
    Rails.logger.debug "OmniauthCallbacksController#failure called"
    # 失敗時リダイレクト
    redirect_to "#{ENV['FRONTEND_URL']}/login?error=authentication_failed", allow_other_host: true
  end
end
