require 'indico'

#Load INDICO key
INDICO_CONFIG = YAML.load_file("#{::Rails.root}/config/indico.yml")[::Rails.env]

#Initialize INDICO connection
Indico.api_key = INDICO_CONFIG['api_key']

puts "Load INDICO enviroments: OK"
