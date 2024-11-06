module Api
  module V1
    module Auth
      class TokensController < ApplicationController
        skip_before_action :authenticate_user!

        def refresh
          refresh_token = RefreshToken.find_by_token(params[:refresh_token])

          if refresh_token && refresh_token.expires_at > Time.current
            user = refresh_token.user
            new_access_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

            render json: { access_token: new_access_token }, status: :ok
          else
            render json: { error: 'Invalid or expired refresh token' }, status: :unauthorized
          end
        end
      end
    end
  end
end