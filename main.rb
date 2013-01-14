require 'rubygems'  
require 'sinatra'
require 'sinatra/base'
require 'json'
require 'pry'

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
                    "assignment_duration" => 10
              }
            }, 
            {"match_maker" =>
              {"inputs" => 
                 { "image_url" => "http://www.finewallpaperss.com/wp-content/uploads/2012/10/Funny-Jokes-Wallpaper.jpg"
                 },
                "reward" => 20,
                "assignment_id" => 2,
                "assignment_duration" => 20
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
                "assignment_duration" => 30
              }
            }]


  get '/' do
  	erb :index
  end

  get '/template/:name' do
  	File.read(File.join('public', "#{params[:name]}.html"))
  end

  get '/work' do
    random_task = TASKS_ARR.shuffle.first 
    template_id = random_task.keys.first
    sleep(0.5)
    data = { :template => template_id, 
        :inputs => random_task[template_id]['inputs'],
        :meta => { :reward => random_task[template_id]['reward'], :assignment_id => random_task[template_id]['assignment_id'], :assignment_duration => random_task[template_id]['assignment_duration']}
      }
    int = rand(5)
    if (int == 1)
      gold = [
        {:note => {:message => "You nailed down a spot check correctly. Keep it up", :status => "success"}}, 
        {:note => {:message => "You failed to pass the spot check. Be careful next time.", :status => "warning"}},
        {:note => {:message => "1000 medical tasks just added to system. Enjoy.", :status => "notice"}},
        {:note => {:message => "Some cloudworkers are found to submit blank tasks. Stop doing it or you'll be automatically banned.", :status => "error"}}
        ].shuffle.first
      data.merge!(gold)
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