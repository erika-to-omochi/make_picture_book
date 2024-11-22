class AddBackgroundColorToPages < ActiveRecord::Migration[7.1]
  def change
    add_column :pages, :background_color, :string
  end
end
