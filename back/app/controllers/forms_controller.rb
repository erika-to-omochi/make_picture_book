class FormsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  require 'net/http'
  require 'uri'

  def create
    form_params = params.require(:form).permit(
      :question_type,
      :other_question_type,
      :content,
      :name,
      :email,
      :rating,
      :rating_reason,
      :agreement
    )

    # お問い合わせ種類が「その他」の場合、入力された値を使用
    question_type_value = if form_params[:question_type] == 'その他'
                            form_params[:other_question_type]
                          else
                            form_params[:question_type]
                          end

    # GoogleフォームのエンドポイントURL
    google_form_url = 'https://docs.google.com/forms/d/e/1FAIpQLSdKkkhvmRB1-xhbf6xqI27Pia-qkTdX-c-Xj7n2iHcpxYiybw/formResponse'

    # フォームデータをGoogleフォームの形式にマッピング
    google_form_data = {
      'entry.114158159' => question_type_value,        # お問い合わせ種類
      'entry.190174363' => form_params[:content],      # 内容
      'entry.1355840158' => form_params[:name],        # 名前
      'entry.1146681366' => form_params[:email],       # アドレス
      'entry.636494628' => form_params[:rating],       # 評価
      'entry.429882784' => form_params[:rating_reason],# 理由
      'entry.649895501' => "了承しました。"            # 固定値：了承
    }

    # データをGoogleフォームに送信
    uri = URI.parse(google_form_url)
    response = Net::HTTP.post_form(uri, google_form_data)

    if response.is_a?(Net::HTTPSuccess) || response.is_a?(Net::HTTPRedirection)
      render json: { message: '送信成功！' }, status: :ok
    else
      render json: { error: '送信に失敗しました。' }, status: :unprocessable_entity
    end
  end
end
