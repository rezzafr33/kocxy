# kocxyz

A command-line tool for interacting with the [Knockout City community servers](https://kocity.xyz).

## Usage

```shell
Usage: kocxyz [options]
```

## Examples

- Perform login or register if not registered yet:
  ```shell
  kocxyz --auth
  ```

- View available server(s):
  ```shell
  kocxyz --server
  ```

- Generate launch arguments for the game executable with a preferred language and server:
  ```shell
  kocxyz --lang fr --server fra-01.ko.hosmatic.com:23600
  ```

## Options

- `-a, --auth`: Perform authentication (boolean)

- `-l, --lang`: Preferred language (string, choices: "de", "en", "es", "fr", "it", "ja", "ko", "pl", "pt", "ru", "zh", default: "en")

- `-s, --server`: Enter a server's IP address or domain, or leave it empty to view available servers.

- `-h, --help`: Show help (boolean)

- `-v, --version`: Show version number (boolean)

## Building the Binary

To build the binary, follow these steps:

1. Clone the repository to your local machine:

   ```shell
   git clone https://github.com/rezzafr33/kocxyz.git
   ```

2. Navigate to the project directory:

   ```shell
   cd kocxyz
   ```

3. Install the required dependencies:

   ```shell
   npm install
   ```

4. Build the binary:

   ```shell
   npm run build
   ```
