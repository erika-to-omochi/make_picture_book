Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'sessions'
  }

  post '/token/refresh', to: 'tokens#refresh'
end
