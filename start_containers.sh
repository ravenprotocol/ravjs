
C1=ravjs_worker1
C2=ravjs_worker2
C3=ravjs_worker3

sudo docker stop $C1
sudo docker rm $C1

sudo docker stop $C2
sudo docker rm $C2

sudo docker stop $C3
sudo docker rm $C3

sudo docker run --name $C1 -d -p 4444:4444 -p 7900:7900 -v /dev/shm:/dev/shm selenium/standalone-chrome:4.0.0-beta-4-prerelease-20210517
sudo docker run --name $C2 -d -p 4445:4444 -p 7901:7900 -v /dev/shm:/dev/shm selenium/standalone-chrome:4.0.0-beta-4-prerelease-20210517
sudo docker run --name $C3 -d -p 4446:4444 -p 7902:7900 -v /dev/shm:/dev/shm selenium/standalone-chrome:4.0.0-beta-4-prerelease-20210517