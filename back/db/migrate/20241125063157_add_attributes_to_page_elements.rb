class AddAttributesToPageElements < ActiveRecord::Migration[7.1]
  def change
    add_column :page_elements, :font_size, :float
    add_column :page_elements, :font_color, :string
    add_column :page_elements, :position_x, :float
    add_column :page_elements, :position_y, :float
    add_column :page_elements, :rotation, :float
    add_column :page_elements, :scale_x, :float
    add_column :page_elements, :scale_y, :float
  end
end
