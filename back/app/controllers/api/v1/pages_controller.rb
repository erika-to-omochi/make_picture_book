class Api::V1::PagesController < ApplicationController
  def create
    puts "DEBUG: Original params = #{params.inspect}"
    puts "DEBUG: page_params = #{page_params.inspect}"

    page = Page.new(page_params)

    if page.save
      render json: { page: page.as_json(include: [:page_characters, :page_elements]) }, status: :created
    else
      render json: { errors: page.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def page_params
    params.require(:page).permit(
      :book_id,
      :page_number,
      :content,
      page_characters_attributes: [
        :character_type,
        :simple_path, :body_path, :hair_path, :eye_path, :mouth_path,
        :hand_path, :foot_path, :outfit_path, :position_x, :position_y, :rotation, :scale_x, :scale_y
      ],
      page_elements_attributes: [
        :element_type,
        content: [:text, :font_size, :font_color, :position_x, :position_y]
      ]
    )
  end
end
