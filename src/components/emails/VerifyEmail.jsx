import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Img,
} from "@react-email/components";

const VerifyEmail = ({ username, email, image, url, selectedMethod }) => {
  return (
    <Html>
      <Head />
      <Preview>verify in to {process.env.DOMAIN}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={company}></Text>
          <Heading style={codeTitle}>A new user verification pending </Heading>
          <Text style={codeDescription}>
            here email is : {email} and username is : {username} on :{" "}
            {selectedMethod}
          </Text>
          <Img
            src={image}
            alt={`${username} payment Reciptant`}
            style={{
              width: "400px",
              height: "100%",
            }}
          />
          <Heading style={codeTitle}>
            Please verify this account by clicking the button below.
          </Heading>
          <Section style={buttonContainer}>
            <Button href={url} style={button}>
              Verify User
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmail;

const main = {
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
  textAlign: "center",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #ddd",
  borderRadius: "5px",
  marginTop: "20px",
  width: "480px",
  maxWidth: "100%",
  margin: "0 auto",
  padding: "12% 6%",
};
const html = {
  backgroundColor: "#000",
  color: "#fff",
};

const company = {
  fontWeight: "bold",
  fontSize: "18px",
  textAlign: "center",
};

const codeTitle = {
  textAlign: "center",
};

const codeDescription = {
  textAlign: "center",
};

const buttonContainer = {
  margin: "27px auto",
  width: "auto",
};

const button = {
  backgroundColor: "#5e6ad2",
  borderRadius: "3px",
  fontWeight: "600",
  color: "#fff",
  textAlign: "center",
  padding: "12px 24px",
  margin: "0 auto",
};
