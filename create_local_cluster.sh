for ((i=1;i<=$1;i++)); do
    {
      sudo docker stop ravjs_worker$i
    } || {
      echo "No container found"
    }

    {
      sudo docker rm ravjs_worker$i
    } || {
      echo "No container found"
    }

    sudo docker run --name ravjs_worker$i -d -p 444$i:4444 -p 790$i:7900 -v /dev/shm:/dev/shm selenium/standalone-chrome:4.0.0-beta-4-prerelease-20210517
    sleep 5
    python open_worker.py -n ravjs_worker$i -H 127.0.0.1 -p 444$i
done


