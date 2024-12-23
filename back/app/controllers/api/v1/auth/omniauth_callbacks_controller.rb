# app/controllers/api/v1/auth/omniauth_callbacks_controller.rb

module Api
  module V1
    module Auth
      class OmniauthCallbacksController < Devise::OmniauthCallbacksController
        def google_oauth2
          Rails.logger.debug "OmniauthCallbacksController#google_oauth2 called"
          Rails.logger.debug "Auth hash: #{request.env['omniauth.auth'].inspect}"

          @user = User.from_omniauth(request.env['omniauth.auth'])

          if @user.persisted?
            token = @user.generate_jwt # devise-jwtを使用してトークンを生成
            render json: { token: token, user: @user }, status: :ok
          else
            render json: { error: '認証に失敗しました。' }, status: :unauthorized
          end
        end

        def failure
          Rails.logger.debug "OmniauthCallbacksController#failure called"
          render json: { error: '認証に失敗しました。' }, status: :unauthorized
        end
      end
    end
  end
end
