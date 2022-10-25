var nr = 0;

const settings = {
	"video_id": 0;
};

function guess()
{
	console.log(settings.video_id);
};

function start()
{
	var pass = document.getElementById("pass").value.toLowerCase();
	var incorrect = document.getElementById("incorrect");
	incorrect.innerHTML = "Încearcă din nou :)";
	
	if(pass == "unicorn")
	{
		incorrect.style.display = "none";
		window.location.href = "google.com";
	}
	else
	{
		nr++;
		
		if(nr >= 2 && nr < 3)
		{
			incorrect.innerHTML = "HINT: animal cu un corn în frunte";
		}
		
		else if(nr >= 3 && nr < 4)
		{
			incorrect.innerHTML = "HINT: primul cuvânt din numele firmei lu' fii-ta";
		}
		
		else if(nr >= 4)
		{
			incorrect.innerHTML = "HINT: ok, ok, parola e UNICORN";
		}
		
		incorrect.style.display = "block";
	}
}