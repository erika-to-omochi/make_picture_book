
module Api
  module V1
    module Auth
      class OmniauthCallbacksController < Devise::OmniauthCallbacksController
        skip_before_action :authenticate_user!

        def google_oauth2
          Rails.logger.debug "OmniauthCallbacksController#google_oauth2 called"
          Rails.logger.debug "Auth hash: #{request.env['omniauth.auth'].inspect}"

          @user = User.from_omniauth(request.env['omniauth.auth'])
          if @user.persisted?
            token = @user.generate_jwt
            # ここでフロントエンドにリダイレクト
            redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{token}&user_name=#{@user.name}", allow_other_host: true
          else
            # 失敗時フロントエンドにエラー状態でリダイレクト
            redirect_to "#{ENV['FRONTEND_URL']}/login?error=authentication_failed", allow_other_host: true
          end
        end

        def failure
          Rails.logger.debug "OmniauthCallbacksController#failure called"
          # 失敗時リダイレクト
          redirect_to "#{ENV['FRONTEND_URL']}/login?error=authentication_failed", allow_other_host: true
        end
      end
    end
  end
end
