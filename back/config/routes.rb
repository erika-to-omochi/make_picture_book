docker compose restart back
Rails.application.routes.draw do
  root to: 'application#health_check'
end
