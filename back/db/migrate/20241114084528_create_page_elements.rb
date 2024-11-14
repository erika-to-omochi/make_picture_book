class CreatePageElements < ActiveRecord::Migration[7.1]
  def up
    # Enum型 'element_type_enum' を作成
    execute <<-SQL
      CREATE TYPE element_type_enum AS ENUM ('object', 'nature', 'text', 'background');
    SQL

    create_table :page_elements do |t|
      t.references :page, null: false, foreign_key: true
      # 定義したenum型 'element_type_enum' を使用
      t.column :element_type, :element_type_enum, null: false
      t.jsonb :content, null: false
      t.timestamps
    end

    add_index :page_elements, :element_type
  end

  def down
    # テーブル削除
    drop_table :page_elements

    # Enum型 'element_type_enum' を削除
    execute <<-SQL
      DROP TYPE element_type_enum;
    SQL
  end
end
