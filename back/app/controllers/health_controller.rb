class HealthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:check]
  def check
    render json: { status: 'ok' }, status: :ok
  end
end
