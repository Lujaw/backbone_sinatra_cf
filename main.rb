require 'rubygems'  
require 'sinatra'
require 'sinatra/base'
require 'json'
require 'pry'
require 'opal'
require 'uri'

module RubyJS
  def self.ruby_js
      str = <<-EOF
            def validate(options)
              errors = []
              options = JSON.parse(options)
              middle_name = options[:middle_name]
              unless middle_name.upcase == 'J.'
                errors << {field: "middle_name", input: middle_name, expected: 'J.'}
              end
              age = options[:age]
              unless age == '20'
                errors << {field: "age", input: age, expected: '20'}
              end
              errors.to_json
            end
          EOF
         URI::escape(str)
  end
end

class MyApp < Sinatra::Base
 
TASKS_ARR = [
           {"tweet_analyzer" => 
             {"inputs" => 
                    { 
                       "profile_pic" => "http://profile.ak.fbcdn.net/hprofile-ak-snc6/c29.29.368.368/s160x160/223781_10150271514485069_7600479_n.jpg",
                       "text" => "This is something that is gonna be huge and HUGE"
                    },
                    "reward" => 10,
                    "assignment_id" => 1,
                    "assignment_duration" => 100
              }
            }, 
            {"match_maker" =>
              {"inputs" => 
                 { "image_url" => "http://www.finewallpaperss.com/wp-content/uploads/2012/10/Funny-Jokes-Wallpaper.jpg"
                 },
                "reward" => 20,
                "assignment_id" => 2,
                "assignment_duration" => 200
              }
            }, 
            {"census" => 
              {"inputs"=>
                {
                  "name_image_url" =>"http://us-census-app2.0.s3.amazonaws.com/image/name.jpg",
                  "age_image_url" => "http://us-census-app2.0.s3.amazonaws.com/image/age_slice.jpg"
                },
                "reward" => 30,
                "assignment_id" => 3,
                "assignment_duration" => 300
              }
            }]


  get '/' do
  	erb :index
  end

  get '/template/:name' do
  	File.read(File.join('public', "#{params[:name]}.html"))
  end

  get '/work' do
    random_task = TASKS_ARR.shuffle.last 
    template_id = random_task.keys.first
    sleep(0.5)
    data = { :template => template_id, 
        :inputs => random_task[template_id]['inputs'],
        :meta => { 
          :reward => random_task[template_id]['reward'], :assignment_id => random_task[template_id]['assignment_id'], :assignment_duration => random_task[template_id]['assignment_duration']
        }
      }
    int = rand(5)
    if (int == 3)
      note = [
        {:note => {:message => "1000 medical tasks just added to system. Enjoy.", :status => "notice"}},
        {:note => {:message => "Some cloudworkers are found to submit blank tasks. Stop doing it or you'll be automatically banned.", :status => "error"}}
        ].shuffle.first
      data.merge!(note)
    elsif (int == 4)
     # data.merge!({:no_more_task => true})
    end
    if template_id == "census"
      data.merge!({
      :gold => true,
      :spotboy => RubyJS.ruby_js
      })
    end
    content_type :json
      data.to_json
  end

  post '/flag' do
    params = JSON.parse(request.body.read)
    puts params
  end

  post '/work' do
    puts JSON.parse(request.body.read)
  end

end