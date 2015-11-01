module Api
  module V1  
    class TokenController < ActionController::API

      # POST /check.json
      def check
        token = params[:token]
        if ApiKey.exists?(access_token: token)
          render json: token.to_json
        else
          raise "token_not_valid"
        end
      end

    end  
  end
end