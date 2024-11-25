class AddTextAndSrcToPageElements < ActiveRecord::Migration[7.1]
  def change
    add_column :page_elements, :text, :string
    add_column :page_elements, :src, :string
  end
end
