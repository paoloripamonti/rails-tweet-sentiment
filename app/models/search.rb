class Search < ActiveRecord::Base

  INDICO_WIDGET = 3

  # Get all Search object created into Month Range
  scope :request_for_month, -> { where("created_at > ? AND  created_at < ?", Time.now.beginning_of_month, Time.now.end_of_month) }

  # Analize text or tweet
  def self.analize(search)
    results = []
    results = Utility.analize(search.text)
    search.result = results.size * Search::INDICO_WIDGET
    search.sentiment = Utility.average_sentiment(results)
    search.success = true
    search.save
    results
  end

end
