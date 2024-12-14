class OgpController < ApplicationController
  def show
    title = params[:title]
    author = params[:author]

    # 出力先のパス (tmpディレクトリに出力)
    output_path = Rails.root.join("tmp", "ogp_#{title.parameterize}.png")

    # 動的なタイトル・作者を使って画像生成
    OgpGenerator.generate(
      title: title,
      author: author,
      output_path: output_path
    )

    # 生成した画像を返却
    send_file output_path, type: 'image/png', disposition: 'inline'
  end
end
