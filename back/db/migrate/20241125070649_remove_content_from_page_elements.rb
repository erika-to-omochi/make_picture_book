class RemoveContentFromPageElements < ActiveRecord::Migration[7.1]
  def change
    remove_column :page_elements, :content, :jsonb
  end
end
