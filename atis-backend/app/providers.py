import os
class Providers:
    USE_REAL = False
    def __init__(self):
        self.AT_API_KEY = os.getenv("AT_API_KEY")
        self.NZTA_API_KEY = os.getenv("NZTA_API_KEY")
        self.METSERVICE_API_KEY = os.getenv("METSERVICE_API_KEY")
