Rails.application.routes.draw do
  devise_for :users, path: 'api/v1/auth', controllers: {
    sessions: 'api/v1/auth/sessions',
    registrations: 'api/v1/auth/registrations',
    passwords: 'api/v1/auth/passwords'
  }
end
