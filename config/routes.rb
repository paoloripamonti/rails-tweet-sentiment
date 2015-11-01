Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post 'search' => 'search#create'
      post 'token' => 'token#check'
      get 'info' => 'search#info'
    end
  end
end
