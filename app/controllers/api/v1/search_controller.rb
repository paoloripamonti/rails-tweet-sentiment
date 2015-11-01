module Api
  module V1  
    class SearchController < ActionController::API
      include ActionController::HttpAuthentication::Token::ControllerMethods

      before_filter :restrict_access

      # POST /create.json
      def create
        search = Search.new
        search.text = params[:text]
        @results = Search.analize(search)
        render json: @results.to_json
      end

      # GET /info.json
      def info
        @info_hash = Utility.info_hash
        render json: @info_hash.to_json
      end

      private

        def restrict_access
          authenticate_or_request_with_http_token do |token, options|
            ApiKey.exists?(access_token: token)
          end
        end

    end  
  end
end