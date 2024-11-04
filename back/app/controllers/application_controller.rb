class ApplicationController < ActionController::API
  def health_check
    render json: { status: 'OK', message: 'Rails API server is running' }, status: :ok
  end
end
