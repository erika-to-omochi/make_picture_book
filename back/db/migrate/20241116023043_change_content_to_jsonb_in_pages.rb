class ChangeContentToJsonbInPages < ActiveRecord::Migration[7.1]
  def up
    # 一時カラムを作成
    add_column :pages, :content_temp, :jsonb, default: {}, null: false

    # 既存のデータを一時カラムに移行（文字列をJSONに変換）
    Page.reset_column_information
    Page.find_each do |page|
      begin
        # Rubyのハッシュ形式をJSON形式に変換
        parsed = JSON.parse(page.content.gsub('=>', ':')) 
        page.update_column(:content_temp, parsed)
      rescue JSON::ParserError
        # パースに失敗した場合は空のハッシュを設定
        page.update_column(:content_temp, {})
      end
    end

    # 元のカラムを削除
    remove_column :pages, :content

    # 一時カラムを元の名前に変更
    rename_column :pages, :content_temp, :content
  end

  def down
    # 元に戻す操作
    add_column :pages, :content_temp, :string

    Page.reset_column_information
    Page.find_each do |page|
      page.update_column(:content_temp, page.content.to_json)
    end

    remove_column :pages, :content
    rename_column :pages, :content_temp, :content
  end
end
