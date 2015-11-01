#Load TWITTER key
TWITTER_CONFIG = YAML.load_file("#{::Rails.root}/config/twitter.yml")[::Rails.env]

#Initialize TWITTER connection
$twitter = Twitter::REST::Client.new do |config|
  config.consumer_key = TWITTER_CONFIG['consumer_key']
  config.consumer_secret = TWITTER_CONFIG['consumer_secret']
  config.access_token = TWITTER_CONFIG['access_token']
  config.access_token_secret = TWITTER_CONFIG['access_token_secret']
end
puts "Load TWITTER enviroments: OK"
