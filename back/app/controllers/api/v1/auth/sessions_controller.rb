class Api::V1::Auth::SessionsController < Devise::SessionsController
  skip_before_action :authenticate_user!, only: [:create]
  respond_to :json

  def create
    # ネストされたパラメータからemailとpasswordを取得
    user = User.find_by(email: user_params[:email])

    if user&.valid_password?(params.dig(:user, :password))

      # リフレッシュトークンを生成
      refresh_token = user.refresh_tokens.create!(expires_at: 7.days.from_now)
      # JWTアクセストークンを生成
      access_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

      render json: {
        message: 'ログインしました',
        access_token: access_token,
        refresh_token: refresh_token.plain_token,
        user: UserSerializer.new(user).serializable_hash
      }, status: :ok
    else
      render json: { error: 'メールアドレスかパスワードが正しくありません' }, status: :unauthorized
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    if current_user
      # リフレッシュトークンの削除
      current_user.refresh_tokens.find_by(token: params[:refresh_token])&.destroy
    end
    render json: { message: 'ログアウトしました' }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end

  def respond_with(resource, _opts = {})
    render json: UserSerializer.new(resource).serializable_hash, status: :ok
  end

  def respond_to_on_destroy
    head :no_content
  end
end
