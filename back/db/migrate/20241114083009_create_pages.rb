class CreatePages < ActiveRecord::Migration[7.1]
  def change
    create_table :pages do |t|
      t.references :book, null: false, foreign_key: true
      t.integer :page_number, null: false
      t.text :content, null: false
      t.timestamps
    end
  end
end
