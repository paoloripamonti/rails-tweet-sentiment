class CreateMonthlyRequests < ActiveRecord::Migration
  def self.up
    create_table :monthly_requests do |t|
      t.integer   :num, :default => 50000
      t.timestamps null: false
    end

    MonthlyRequest.create
  end

  def self.down
    drop_table  :monthly_requests
  end

end
