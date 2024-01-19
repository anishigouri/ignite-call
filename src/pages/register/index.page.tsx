import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../../lib/axios'
import { Container, Form, FormError, Header } from './styles'

export default function Register() {
  const registerFormSchema = z.object({
    username: z
      .string()
      .min(3, { message: 'O usuário precisa ter pelos menos 3 letras.' })
      .regex(/^([a-z\\-]+)$/i, {
        message: 'O usuário pode ter apenas letras e hifens',
      })
      .transform((username) => username.toLocaleLowerCase()),
    name: z
      .string()
      .min(3, { message: 'O nome precisa ter pelo menos 3 letras' }),
  })

  type RegisterFormData = z.infer<typeof registerFormSchema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  })

  const router = useRouter()

  useEffect(() => {
    const username = router.query?.username

    if (username) {
      setValue('username', String(username))
    }
  }, [router.query?.username])

  async function handleRegister(data: RegisterFormData) {
    try {
      const { name, username } = data
      await api.post('/users', {
        name,
        username,
      })

      await router.push('/register/connect-calendar')
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        alert(err.response.data.message)
        return
      }

      console.error(err)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="ignite.com/"
            placeholder="seu-usuario"
            crossOrigin="true"
            {...register('username')}
          ></TextInput>

          {errors.username && (
            <FormError size="sm">{errors.username.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput
            placeholder="seu-nome"
            crossOrigin="true"
            {...register('name')}
          ></TextInput>

          {errors.name && (
            <FormError size="sm">{errors.name.message}</FormError>
          )}
        </label>

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo <ArrowRight />
        </Button>
      </Form>
    </Container>
  )
}
