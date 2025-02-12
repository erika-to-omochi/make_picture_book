class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  skip_before_action :authenticate_user!, only: [:create]
  respond_to :json

  def create
    build_resource(sign_up_params)

    if resource.save
      # リフレッシュトークンを生成
      refresh_token = resource.refresh_tokens.create!(expires_at: 7.days.from_now)
      # JWTアクセストークンを生成
      access_token = Warden::JWTAuth::UserEncoder.new.call(resource, :user, nil).first

      render json: {
        message: 'アカウントを作成し、ログインしました',
        access_token: access_token,
        refresh_token: refresh_token.plain_token,
        user: UserSerializer.new(resource).serializable_hash
      }, status: :created
    else
      render_registration_errors(resource)
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end

  def render_registration_errors(resource)
    # 全てのエラーメッセージを直接取得して返す
    custom_errors = resource.errors.full_messages

    render json: {
      errors: custom_errors,
      access_token: nil,
      user: nil
    }, status: :unprocessable_entity
  end
end
