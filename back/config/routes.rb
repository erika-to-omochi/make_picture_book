Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'sessions'
  }
  post 'signup', to: 'registrations#create'
  post 'login', to: 'sessions#create'
  delete 'logout', to: 'sessions#destroy'
  post 'password/forgot', to: 'passwords#create'
  patch 'password/reset', to: 'passwords#update'
  post '/token/refresh', to: 'tokens#refresh'
end
