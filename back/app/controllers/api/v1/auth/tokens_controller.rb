module Api
  module V1
    module Auth
      class TokensController < ApplicationController
        skip_before_action :authenticate_user!, only: [:refresh], raise: false

        def refresh
          Rails.logger.debug "Received refresh_token: #{params[:refresh_token]}"
          # 送信されたトークンをハッシュ化
          hashed_token = Digest::SHA256.hexdigest(params[:refresh_token])
          Rails.logger.debug "Hashed refresh_token: #{hashed_token}"
          # ハッシュ化されたトークンで検索
          refresh_token = RefreshToken.find_by(token: hashed_token)
          if refresh_token
            Rails.logger.debug "Found refresh_token: #{refresh_token.inspect}"
          else
            Rails.logger.debug "Refresh token not found or invalid"
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
