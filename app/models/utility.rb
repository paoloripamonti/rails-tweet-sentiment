class Utility < Twitter::Base

  TWEET_ATTRIBUTE_ARR = [:id, :id_str, :text, :created_at, :source, :lang, :user]
  MAX_TWEET_RESULT = 100
  TWEET_LANG = "en"
  MAX_TAG = 5

  #Analize text or tweet
  def self.analize(text)
    raise "text_not_valid" if text==nil ||text==""
    raise "no_request_avaiable" if Utility.request_avaiable==0
    return Utility.analize_tweets(text)
  end

  # Analize tweets
  def self.analize_tweets(text)
    tweets_hash = Utility.tweet_search(text)
    return [] if tweets_hash=={}
    sentiment_hash = Utility.sentiment_analize_tweets(tweets_hash.values)
    text_tags_hash = Utility.text_tags_analize_tweets(tweets_hash.values)
    keywords_hash = Utility.keywords_analize_tweets(tweets_hash.values)
    geocode_hash = Utility.geocode_analize_tweets(tweets_hash.values)
    tweets_hash.values.each do |tweet|
      tweet.delete(:user)
      tweet[:sentiment]=sentiment_hash[tweet[:id]]
      tweet[:text_tags]=text_tags_hash[tweet[:id]]
      tweet[:keywords]=keywords_hash[tweet[:id]]
      tweet[:geocode]=geocode_hash[tweet[:id]]  
    end  
  end

  # Search tweet on twitter
  # Return Hash, exmaple:  Hash[632138276552450048]=#<Twitter::Tweet id=632138276552450048>
  def self.tweet_search(text)
    tweets = []
    $twitter.search(text, :lang => Utility::TWEET_LANG).take(Utility.request_avaiable).each do |tweet|
      tweets << tweet.to_h.keep_if{|k,v| Utility::TWEET_ATTRIBUTE_ARR.include? k }
    end
    tweet_ids = tweets.collect{|tweet| tweet[:id]}
    Hash[tweet_ids.zip(tweets)]
  end

  # Get sentiment analisys for tweets array
  # Return Hash, exmaple:  Hash[632138276552450048]=0.8731531668393882 
  def self.sentiment_analize_tweets(tweets)
    hash = {}
    return hash if tweets==nil ||tweets.empty?
    sentiment_arr = Utility.sentiment_analize_text( tweets.collect{|e| e[:text]} )
    tweet_ids = tweets.collect{|e| e[:id]}
    Hash[tweet_ids.zip(sentiment_arr)]
  end

  # Get tag for tweets array
  # Return Hash, exmaple:  Hash[632138276552450048]={ "food"=>0.3713687833244494, "cars"=>0.0037924017632370586, ...}
  def self.text_tags_analize_tweets(tweets)
    hash = {}
    return hash if tweets==nil ||tweets.empty?
    sentiment_arr = Utility.text_tags_analize_text( tweets.collect{|e| e[:text]} )
    tweet_ids = tweets.collect{|e| e[:id]}
    Hash[tweet_ids.zip(sentiment_arr)]
  end


  # Get keywords analisys for tweets array
  # Return Hash, exmaple:  Hash[632138276552450048]={"state"=>0.38810469246709006, "sunshine"=>0.61189530753291}
  def self.keywords_analize_tweets(tweets)
    hash = {}
    return hash if tweets==nil ||tweets.empty?
    sentiment_arr = Utility.keywords_analize_text( tweets.collect{|e| e[:text]} )
    tweet_ids = tweets.collect{|e| e[:id]}
    Hash[tweet_ids.zip(sentiment_arr)]
  end

  # Get the sentiment average of tweets hash
  def self.average_sentiment(tweets_hash)
    arr_sentiment = tweets_hash.collect{|e| e[:sentiment]} 
    results = arr_sentiment.inject{ |sum, e| sum + e }.to_f / arr_sentiment.size
    (results.is_a?(Float) && results.nan?) ? 0 : results
  end

  # Get sentiment analisys for text array
  # Return number, example: [0.8731531668393882, 0.68598496325698, ... ]
  def self.sentiment_analize_text(arr)
    Indico.sentiment_hq(arr)
  end

  # Get tags analisys for text array
  # Return number, example: { "food"=>0.3713687833244494, "cars"=>0.0037924017632370586, ...}
  def self.text_tags_analize_text(arr)
    Indico.text_tags(arr, {:top_n => Utility::MAX_TAG })
  end

  # Get tags keywords for text array
  # Return number, example: { "food"=>0.3713687833244494, "cars"=>0.0037924017632370586, ...}
  def self.keywords_analize_text(arr)
    Indico.keywords(arr, {:top_n => Utility::MAX_TAG })
  end

  # Get max request avaiable
  # Return number between 1 and MAX_TWEET_RESULT
  def self.request_avaiable    
    tot_request_avaiable = Utility.max_monthly_request_avaiable
    if tot_request_avaiable > Utility::MAX_TWEET_RESULT
      return Utility::MAX_TWEET_RESULT
    else
      return tot_request_avaiable
    end      
  end

  # Get max monthly request avaiable
  # Return number between 0 and 500000
  def self.max_monthly_request_avaiable
    (MonthlyRequest.first.num - Search.request_for_month.sum(:result))
  end

  # Get hash of account info
  # Return hash
  def self.info_hash
    hash = {}
    hash[:range_start_at] = Time.now.beginning_of_month.to_date
    hash[:range_end_at] = Time.now.end_of_month.to_date
    hash[:max_monthly_request] = MonthlyRequest.first.num
    hash[:tot_request_executed] = Search.request_for_month.sum(:result)
    hash[:request_avaiable] = hash[:max_monthly_request] - hash[:tot_request_executed]
    hash
  end

  # Get Hash with country code and tweet numbe rof country
  # Return hash, ex: {"IT" => 2}
  def self.geocode_analize_tweets(tweets)
    arr = []
    tweets.each do |tweet|
      hash = {}
      location = tweet[:user][:location]
      if location!=nil && location!=""
        Geocoder.search(location).each do |geocode|
          if geocode!=nil && geocode.country_code!=nil
            if hash[geocode.country_code]!=nil
              hash[geocode.country_code]=hash[geocode.country_code]+1
            else
              hash[geocode.country_code]=1
            end
          end
        end
      end
      arr << hash
    end
    tweet_ids = tweets.collect{|e| e[:id]}
    Hash[tweet_ids.zip(arr)]
  end

end