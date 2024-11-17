module Api
  module V1
    module Auth
      class TokensController < ApplicationController
        skip_before_action :authenticate_user!, only: [:refresh], raise: false

        def refresh
          Rails.logger.debug("Received params: #{params.inspect}")

          token = params[:refresh_token] || params.dig(:token, :refresh_token)
          Rails.logger.debug("Extracted token: #{token}")

          if token.nil?
            Rails.logger.error("No refresh token provided in the request")
            render json: { error: 'リフレッシュトークンが提供されていません' }, status: :unprocessable_entity
            return
          end

          refresh_token = RefreshToken.find_by_token(token)
          if refresh_token.nil?
            Rails.logger.error("No matching refresh token found")
          elsif refresh_token.expires_at <= Time.current
            Rails.logger.error("Refresh token has expired")
          end

          if refresh_token && refresh_token.expires_at > Time.current
            user = refresh_token.user
            new_access_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

            render json: { access_token: new_access_token }, status: :ok
          else
            render json: { error: 'リフレッシュトークンが無効または期限切れです' }, status: :unauthorized
          end
        end
      end
    end
  end
end
