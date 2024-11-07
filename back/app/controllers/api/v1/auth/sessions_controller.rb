class Api::V1::Auth::SessionsController < ::ApplicationController
  # create アクションのみ認証をスキップ
  skip_before_action :authenticate_user!, only: [:create]
  respond_to :json

  def create
    # パラメータが session キー内にある場合
    email = params[:email] || params.dig(:session, :email)
    password = params[:password] || params.dig(:session, :password)

    user = User.find_by(email: email)

    if user&.valid_password?(password)
      # リフレッシュトークンを生成
      refresh_token = user.refresh_tokens.create!(
        token: SecureRandom.hex(32),
        expires_at: 7.days.from_now
      )

      # JWTアクセストークンを取得
      access_token = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

      render json: {
        access_token: access_token,
        refresh_token: refresh_token.token,
        user: UserSerializer.new(user).serializable_hash
      }, status: :ok
    else
      render json: { error: 'メールアドレスまたはパスワードが正しくありません' }, status: :unauthorized
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    if current_user
      # リフレッシュトークンの削除
      refresh_token = current_user.refresh_tokens.find_by(token: params[:refresh_token])
      if refresh_token
        refresh_token.destroy
        render json: { message: 'ログアウトしました' }, status: :ok
      else
        render json: { error: 'リフレッシュトークンが無効です' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'ユーザーが認証されていません' }, status: :unauthorized
    end
  end

  private

  def respond_with(resource, _opts = {})
    render json: UserSerializer.new(resource).serializable_hash, status: :ok
  end

  def respond_to_on_destroy
    head :no_content
  end
end
