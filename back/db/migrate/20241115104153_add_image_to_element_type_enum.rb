class AddImageToElementTypeEnum < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
      ALTER TYPE element_type_enum ADD VALUE 'image';
    SQL
  rescue ActiveRecord::StatementInvalid => e
    # 既に 'image' が存在する場合はエラーを無視
    puts e.message
  end

  def down
    # PostgreSQLではenumから値を削除できないため、ダウンマイグレーションは不可とする
  end
end
