class OgpController < ApplicationController
  skip_before_action :authenticate_user!, only: [:show]

  def show
    title = params[:title] || "unknown"
    author = params[:author] || "anonymous"

    # ファイル名にタイトル・著者名・タイムスタンプを含める
    file_name = "ogp_#{title.parameterize}_#{author.parameterize}_#{Time.now.to_i}.png"
    output_path = Rails.root.join("public", "ogp", file_name)
    output_url = "/ogp/#{file_name}"

    # ディレクトリが存在しない場合は作成
    FileUtils.mkdir_p(Rails.root.join("public", "ogp"))

    # 画像生成
    OgpGenerator.generate(
      title: title,
      author: author,
      output_path: output_path
    )

    # URLを返却
    render json: { url: output_url }
  end
end
