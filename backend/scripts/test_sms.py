import os
import africastalking
from dotenv import load_dotenv

load_dotenv()

username = os.getenv("AT_USERNAME")
api_key = os.getenv("AT_API_KEY")

africastalking.initialize(username, api_key)

sms = africastalking.SMS

response = sms.send(
    "Hello from EventFlow Africa!",
    ["+254792680639"]
)

print(response)
