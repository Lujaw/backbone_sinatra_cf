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
                    "assignment_id" => 1
              }
            }, 
            {"match_maker" =>
              {"inputs" => 
                 { "image_url" => "https://cfcensusprod.s3-ap-southeast-1.amazonaws.com/1930/0124_resized.jpg"
                 },
                "reward" => 20,
                "assignment_id" => 2
              }
            }, 
            {"census" => 
              {"inputs"=>
                {
                  "name_image_url" =>"http://us-census-app2.0.s3.amazonaws.com/image/name.jpg",
                  "age_image_url" => "http://us-census-app2.0.s3.amazonaws.com/image/age_slice.jpg"
                },
                "reward" => 30,
                "assignment_id" => 3
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
    content_type :json
      { :template => template_id, 
        :inputs => random_task[template_id]['inputs'],
        :meta => { :reward => random_task[template_id]['reward'], :assignment_id => random_task[template_id]['assignment_id']}
      }.to_json
  end

  post '/flag' do
    params = JSON.parse(request.body.read)
    puts params
  end

end